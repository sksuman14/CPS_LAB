'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "23aecc579d5fcbb52a473a2021a7e385",
"assets/AssetManifest.bin.json": "f0df8803196ba3a1c850d1844802dffe",
"assets/AssetManifest.json": "0ae3d3be0c0fa5cfcba1a949c75c34ac",
"assets/assets/images/1.png": "7cd8c89345d9f0e867ca6cf6a654b1d0",
"assets/assets/images/10.png": "3f62455177112deda641f214ffc12278",
"assets/assets/images/11.png": "a0ac470e69a6afadbbdf9ca347cf3fb7",
"assets/assets/images/12.png": "28ac8491d3fc9b5a2d65e78e2407a371",
"assets/assets/images/13.png": "47567752a8ca36f60957ab85933a1e73",
"assets/assets/images/14.png": "8cbfbf6ba271fc383a37a055ac05df3e",
"assets/assets/images/15.png": "2c412981ab99283dd5fd0401ff4321db",
"assets/assets/images/16.png": "5aa2aedd6e2477a738325733b4792ee5",
"assets/assets/images/17.png": "96a65cf4d8ab7dab8602fa406a2ec404",
"assets/assets/images/2.png": "9d8e1f1766be043f601b966387d515d7",
"assets/assets/images/3.png": "704a97719fdb7df4e6e81e6253684467",
"assets/assets/images/4.png": "4b9887371123340dfdd08629308bf791",
"assets/assets/images/5.png": "67e565dc9eb5512533c4dcf03ad3a2c1",
"assets/assets/images/6.png": "8f6ffbc6f6777ad2f55a85627477654e",
"assets/assets/images/7.png": "6e6b80b2f5f97adb8640567621a8cbae",
"assets/assets/images/8.png": "c68db64669be69f5aea17caddc761cf7",
"assets/assets/images/9.png": "f0deadfe11a7106d19cddc1c61547236",
"assets/assets/images/Actitvity.png": "c04f1f3eec7a4240cb09b7d307fd0db1",
"assets/assets/images/blegateway.png": "9ecbdd4cec9456369d506032ee942051",
"assets/assets/images/bleNode.png": "05b49576b227702a646b284df5d18130",
"assets/assets/images/ble_dev_kit.jpg": "a258f9da17afd3a14cd05bf3dfcddc46",
"assets/assets/images/bme680.png": "40f5050d0e814d18f65c156bd5c7064b",
"assets/assets/images/buzzer.png": "01e324c4aee64b6f0cc91579a9df6797",
"assets/assets/images/contact_bg.png": "8ae8a9ba38ba91d8f0d8c87c05dc9bd3",
"assets/assets/images/dataloggerrender.png": "b19ddf59d6841696dd01c13c523ebc12",
"assets/assets/images/deploy.png": "0f8b2d9d597aea93d99c8a78adefad3a",
"assets/assets/images/deployment_bg.png": "1cf9512c77617e50b8d6581946189295",
"assets/assets/images/devboard.png": "daa01ebcbfc41a3f613cfab08c08a71d",
"assets/assets/images/gateway.png": "0d6929cc5e02f44ed1b38baf3406c90b",
"assets/assets/images/gauge.png": "182cfdcc4b2a0d28cb3fb4a22ac4a239",
"assets/assets/images/github.png": "43126600be422870567058fa70a1a40e",
"assets/assets/images/groove.png": "1e4a3f1223c5cad7439e23ad95f5e484",
"assets/assets/images/halleffect.png": "ea309fb5932a754554fb123ea6c14843",
"assets/assets/images/home_bg.jpeg": "70c7c4cee81f873f386993d4b6e21ec0",
"assets/assets/images/home_bg.jpg": "5ba74c18dc2ca654a4639b3c4cb567eb",
"assets/assets/images/IMPACT.png": "64295aadef83ab54aa9b612c066b7164",
"assets/assets/images/ir_sensor.png": "076f798e419a75e91771dd6d6174a16c",
"assets/assets/images/lis3dh.png": "fe2bd8a7543a4e655499bdce29b382bf",
"assets/assets/images/ltr390.png": "0708699fb6d2f00727a1242d87c41063",
"assets/assets/images/lux.png": "e9b90beba240be0a8d32245b106fd42c",
"assets/assets/images/luxpressure.png": "89156c88de30dc5b2e63d9f7b7f03a2b",
"assets/assets/images/memory.png": "7c36da055318fa1ab83b2dfb39937f59",
"assets/assets/images/product_bg.png": "1d1f35a3d51ff90581b8b7412aa15b0c",
"assets/assets/images/programmer.png": "30dab3820a119c6b1a4c2203214afeb1",
"assets/assets/images/relay.png": "9e9cc08b4facc3d4e265efe5d4ced51d",
"assets/assets/images/sts30.png": "69d1f45325f9a964569e16b5969c2051",
"assets/assets/images/stts751.png": "c8a22ad96e2cbcbafaf76ea7a305edf9",
"assets/assets/images/thprobe.png": "1e816fb23aa182a0c851bab4b6a30ca7",
"assets/assets/images/tlv.png": "b713c4e547e3787da8e2e92cb77c6b74",
"assets/assets/images/ultrasonic.png": "94a2f4467a39247188f3514b0c42a83a",
"assets/assets/images/Untitled%20(50%20x%2035%20mm).jpg": "b841c0318e907c626a86a63c01c05c38",
"assets/assets/images/vl5.png": "f95451e88db58551faabac6d4b851b12",
"assets/assets/pdfs/ACTIVITY.pdf": "61aece1fa81339aae26da389d119eba1",
"assets/assets/pdfs/BLEKIT.pdf": "1ab2f3608f5ecb1897a7f112f5c2785c",
"assets/assets/pdfs/BLENODE.pdf": "26d65af1affa2ef996c3c1ce05b82656",
"assets/assets/pdfs/BLE_GATEWAY_Datasheet.pdf": "ee8ed470ad8381fb174f5a32b81d2d25",
"assets/assets/pdfs/BME680.pdf": "8a93a0e10033fc6f75ccce5ab6f3b8e7",
"assets/assets/pdfs/BUZZER.pdf": "d1cde0012f09d295a30db3974afdce58",
"assets/assets/pdfs/Data_logger_datasheet.pdf": "cbbfb973603e1de2f69079b4e65496e3",
"assets/assets/pdfs/FLASHTOOL.pdf": "e26a7e7de7144d04d469487c12f0c749",
"assets/assets/pdfs/GROOVE.pdf": "d77e48c9c42c8e71ee80b9be2caa444f",
"assets/assets/pdfs/HALL.pdf": "6511bf7d90548a1ea48bb00b08b7cb6b",
"assets/assets/pdfs/IR.pdf": "20a837f49b74e42c3124e6aca531f224",
"assets/assets/pdfs/LIS3DH.pdf": "e7a49584e82e7b580e7590bede66927b",
"assets/assets/pdfs/LUX.pdf": "d7fb03740f11683dabde814e6565f1d5",
"assets/assets/pdfs/RELAY.pdf": "f2798dce27a5e8e80c1f7befe642734e",
"assets/assets/pdfs/STTS751.pdf": "5dbb004b2dacd0a8dd24c1a30bd8377e",
"assets/assets/pdfs/TLV.pdf": "7444c5d59b95a038d497039591b0489d",
"assets/assets/pdfs/UVLTR.pdf": "54721d81322bbc5722aa58b98c35ad4a",
"assets/assets/pdfs/VL.pdf": "71b25200255c437b956bb1730a4e41a5",
"assets/assets/pdfs/W25QXX.pdf": "92ad44366c7ebd4c78c1b6a54d105559",
"assets/FontManifest.json": "5a32d4310a6f5d9a6b651e75ba0d7372",
"assets/fonts/MaterialIcons-Regular.otf": "784d229568f4732767683e76cba0f38c",
"assets/NOTICES": "56232a0ad6bb983615e97ff803136b80",
"assets/packages/amplify_auth_cognito_dart/lib/src/workers/workers.min.js": "77727e3a27ad3662c8fe30922a27626e",
"assets/packages/amplify_auth_cognito_dart/lib/src/workers/workers.min.js.map": "1d2af1f0a021761b289f4bf0fed87242",
"assets/packages/amplify_secure_storage_dart/lib/src/worker/workers.min.js": "c21f04e68a1c1dcfecfad44bcd2e8953",
"assets/packages/amplify_secure_storage_dart/lib/src/worker/workers.min.js.map": "9b2bffbaa129cc1c87dc497827f159bd",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/packages/flutter_map/lib/assets/flutter_map_logo.png": "208d63cc917af9713fc9572bd5c09362",
"assets/packages/font_awesome_flutter/lib/fonts/fa-brands-400.ttf": "15d54d142da2f2d6f2e90ed1d55121af",
"assets/packages/font_awesome_flutter/lib/fonts/fa-regular-400.ttf": "262525e2081311609d1fdab966c82bfc",
"assets/packages/font_awesome_flutter/lib/fonts/fa-solid-900.ttf": "269f971cec0d5dc864fe9ae080b19e23",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"canvaskit/canvaskit.js": "728b2d477d9b8c14593d4f9b82b484f3",
"canvaskit/canvaskit.js.symbols": "bdcd3835edf8586b6d6edfce8749fb77",
"canvaskit/canvaskit.wasm": "7a3f4ae7d65fc1de6a6e7ddd3224bc93",
"canvaskit/chromium/canvaskit.js": "8191e843020c832c9cf8852a4b909d4c",
"canvaskit/chromium/canvaskit.js.symbols": "b61b5f4673c9698029fa0a746a9ad581",
"canvaskit/chromium/canvaskit.wasm": "f504de372e31c8031018a9ec0a9ef5f0",
"canvaskit/skwasm.js": "ea559890a088fe28b4ddf70e17e60052",
"canvaskit/skwasm.js.symbols": "e72c79950c8a8483d826a7f0560573a1",
"canvaskit/skwasm.wasm": "39dd80367a4e71582d234948adc521c0",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "83d881c1dbb6d6bcd6b42e274605b69c",
"flutter_bootstrap.js": "3de31df63cb58bb47927198c20879c2d",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "3e99a226af248cda466d18533ab96d6b",
"/": "3e99a226af248cda466d18533ab96d6b",
"main.dart.js": "98fa6ee19348e7533e12c62a9c7a5699",
"manifest.json": "ebf312e0ddf2070ac11082fba2ac8920",
"version.json": "97bc92484249c4f941ba05785f6ddcfc"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
