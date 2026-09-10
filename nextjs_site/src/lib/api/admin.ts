
import { AccessRequest, RequestStatus } from '@/types/admin';

const POST_API_URL = "https://2ebh035wid.execute-api.us-east-1.amazonaws.com/default/CPSPostAccessRequest";
const ADMIN_DATA_API_URL = "https://ag0b7td0za.execute-api.us-east-1.amazonaws.com/default/CPS_Requests_Data_API";
const USER_ACCESS_API_URL = "https://ag0b7td0za.execute-api.us-east-1.amazonaws.com/default/CPS_User_Access_API";

export async function fetchUserAccess(userId: string): Promise<string[]> {
  try {
    const url = `${USER_ACCESS_API_URL}?userId=${encodeURIComponent(userId)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    return data.access || [];
  } catch (err) {
    console.error("fetchUserAccess error:", err);
    return [];
  }
}

export async function fetchAllRequests(email?: string): Promise<AccessRequest[]> {
  try {
    let url = ADMIN_DATA_API_URL;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Failed to load requests: ${response.status}`);
    }

    const data = await response.json();
    let dataList: any[] = [];

    if (Array.isArray(data)) {
      dataList = data;
    } else if (data && typeof data === 'object') {
      dataList = data.items || data.requests || [data];
    }

    return dataList.map((item: any) => ({
      id: item.id || `${item.email}_${item.filename}`,
      userEmail: item.email || item.userEmail || 'unknown',
      userName: item.username || item.userName || 'unknown',
      documentName: item.filename || item.fileName || item.documentName || 'unknown',
      status: parseStatus(item.status || item.requestStatus),
      requestDate: parseRequestDate(item),
      processedDate: item.processedAt || item.updatedAt
    })).filter(req => req.userEmail !== 'unknown');
  } catch (err) {
    console.error("AdminApiService: GET Error -", err);
    return [];
  }
}

/**
 * Robust date parsing equivalent to Flutter's _parseAccessRequest
 */
export function parseRequestDate(item: any): string {
  const dateField = item.requestedAt || item.timestamp || item.createdAt || item.date || item.requestDate || item.request_date;
  
  if (!dateField) return new Date().toISOString();

  let parsedDate: Date;

  if (typeof dateField === 'number') {
    // Treat as milliseconds timestamp
    parsedDate = new Date(dateField);
  } else if (typeof dateField === 'string') {
    // Check if format is dd-MM-yyyy HH:mm:ss
    const customFormatRegex = /^(\d{2})-(\d{2})-(\d{4})\s(\d{2}):(\d{2}):(\d{2})$/;
    const match = dateField.match(customFormatRegex);
    
    if (match) {
      const [_, day, month, year, hour, minute, second] = match;
      // Convert to ISO format (yyyy-MM-ddTHH:mm:ss)
      parsedDate = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
    } else {
      parsedDate = new Date(dateField);
    }
  } else {
    parsedDate = new Date(dateField);
  }

  // Fallback if invalid
  if (isNaN(parsedDate.getTime())) {
    // Try parsing as integer if it was a string that looks like a number
    const asInt = parseInt(String(dateField));
    if (!isNaN(asInt)) {
      parsedDate = new Date(asInt);
    }
  }

  // Final fallback to current date if still invalid
  if (isNaN(parsedDate.getTime())) {
    parsedDate = new Date();
  }

  return parsedDate.toISOString();
}

export async function updateRequestStatus(
  email: string, 
  filename: string, 
  status: RequestStatus,
  currentStatus?: RequestStatus
): Promise<{ success: boolean }> {
  try {
    // Map internal status type to API expected string
    let apiStatus: string = status;
    if (status === 'GRANTED') {
      apiStatus = 'APPROVED';
    } else if (status === 'REVOKED' || status === 'REJECTED') {
      // Logic from Flutter: Reject if was pending, else Revoke
      apiStatus = (currentStatus === 'PENDING') ? 'REJECTED' : 'REVOKED';
    }

    const response = await fetch(POST_API_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, filename, status: apiStatus })
    });

    return { success: response.status === 200 || response.status === 201 };
  } catch (err) {
    console.error("AdminApiService: PATCH Error -", err);
    return { success: false };
  }
}

export async function requestDocumentAccess(email: string, username: string, filename: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(POST_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, filename, status: "PENDING" })
    });

    if (response.status === 200 || response.status === 201) {
      return { success: true };
    } else if (response.status === 409) {
      // Conflict - request already exists. Reset to PENDING.
      return updateRequestStatus(email, filename, 'PENDING');
    } else {
      return { success: false };
    }
  } catch (err) {
    console.error("AdminApiService: POST Error -", err);
    return { success: false };
  }
}

export async function manualGrantAccess(email: string, filename: string): Promise<{ success: boolean }> {
  try {
    const isGrantAll = 
      filename.toUpperCase().includes('ALL') || 
      filename.toLowerCase().includes('everything');

    const targetFilename = isGrantAll ? "ALL" : filename;

    // Step 1: POST to create/ensure the record exists
    await fetch(POST_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username: email.split('@')[0], filename: targetFilename, status: "PENDING" })
    });

    // Step 2: PATCH to immediately set status to APPROVED
    // The backend treats POST as creating a PENDING request regardless of status field,
    // so we must PATCH afterwards to approve it.
    const patchResponse = await fetch(POST_API_URL, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, filename: targetFilename, status: "APPROVED" })
    });

    return { success: patchResponse.status === 200 || patchResponse.status === 201 };
  } catch (err) {
    console.error("AdminApiService: Grant Error -", err);
    return { success: false };
  }
}

function parseStatus(statusStr?: string): RequestStatus {
  if (!statusStr) return 'PENDING';
  const s = statusStr.toUpperCase();
  if (s === 'APPROVED' || s === 'GRANTED') return 'GRANTED';
  if (s === 'REVOKED' || s === 'REJECTED') return 'REVOKED';
  return 'PENDING';
}
