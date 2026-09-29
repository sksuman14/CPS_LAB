
export function getDynamicExamples(sensorName: string) {
  // Determine primary sensor types and context-specific text based on the hardware name
  let primaryType = 'temperature';
  let primaryAnim = 'heat';
  let secondaryType = null;
  let secondaryAnim = null;
  
  let thresholdVal = '30';
  let alertMsg = 'Warning: High Temperature!';
  let critMsg = 'Overheating! Restarting device and disconnecting...';

  if (sensorName.includes('AHT20') || sensorName.includes('STS')) {
    primaryType = 'temperature'; primaryAnim = 'heat';
    if (sensorName === 'AHT20') { secondaryType = 'humidity'; secondaryAnim = 'humidity'; }
    thresholdVal = '30';
    alertMsg = 'Warning: High Temperature!';
    critMsg = 'Overheating! Restarting device and disconnecting...';
  } else if (sensorName === 'Rain Gauge') {
    primaryType = 'rain'; primaryAnim = 'rain';
    thresholdVal = '50';
    alertMsg = 'Warning: Heavy Rainfall!';
    critMsg = 'Flood warning! Restarting device and disconnecting...';
  } else if (sensorName === 'Ultrasonic Anemometer') {
    primaryType = 'wind'; primaryAnim = 'wind';
    thresholdVal = '15';
    alertMsg = 'Warning: High Wind Speeds!';
    critMsg = 'Gale force winds detected! Restarting device...';
  } else if (sensorName === 'VCNL4040' || sensorName === 'VEML7700') {
    primaryType = 'light'; primaryAnim = 'led';
    thresholdVal = '800';
    alertMsg = 'Warning: Extremely bright light!';
    critMsg = 'Sensor blinded! Restarting device...';
  } else if (sensorName === 'Soil Spectra') {
    primaryType = 'moisture'; primaryAnim = 'humidity';
    thresholdVal = '80';
    alertMsg = 'Warning: Soil is over-saturated!';
    critMsg = 'Flooded roots! Restarting device...';
  } else if (sensorName === 'SEN66') {
    primaryType = 'air_quality'; primaryAnim = 'led';
    thresholdVal = '150';
    alertMsg = 'Warning: Poor Air Quality (High AQI)!';
    critMsg = 'Toxic air levels detected! Restarting device...';
  } else if (sensorName === 'LIS3DH' || sensorName === 'LIS2DH') {
    primaryType = 'acceleration_z'; primaryAnim = 'wind';
    thresholdVal = '3';
    alertMsg = 'Warning: Heavy vibration detected!';
    critMsg = 'Fall / Shock detected! Restarting device...';
  }

  // Construct the Master Replica XML dynamically
  let masterReplicaXml = `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="iot_connect" x="50" y="50">
        <next>
          <block type="iot_set_interval">
            <field name="SECONDS">1</field>
            <statement name="DO">
              <block type="iot_animate">
                <field name="ANIM_TYPE">${primaryAnim}</field>
                <value name="VALUE">
                  <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                </value>
                <next>`;

  if (secondaryType && secondaryAnim) {
    masterReplicaXml += `
                  <block type="iot_animate">
                    <field name="ANIM_TYPE">${secondaryAnim}</field>
                    <value name="VALUE">
                      <block type="iot_get_sensor"><field name="SENSOR_TYPE">${secondaryType}</field></block>
                    </value>
                    <next>
                      <block type="iot_log">
                        <value name="VALUE">
                          <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                        </value>
                      </block>
                    </next>
                  </block>`;
  } else {
    masterReplicaXml += `
                  <block type="iot_log">
                    <value name="VALUE">
                      <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                    </value>
                  </block>`;
  }

  masterReplicaXml += `
                </next>
              </block>
            </statement>
          </block>
        </next>
      </block>
    </xml>`;

  return [
    {
      id: 'hello-sensor',
      name: '1. Hello Sensor',
      xml: `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="iot_connect" x="50" y="50">
          <next>
            <block type="iot_set_interval">
              <field name="SECONDS">2</field>
              <statement name="DO">
                <block type="iot_log">
                  <value name="VALUE"><shadow type="text"><field name="TEXT">Checking ${sensorName} status...</field></shadow></value>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>`
    },
    {
      id: 'basic-logger',
      name: `2. ${sensorName} Logger`,
      xml: `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="iot_connect" x="50" y="50">
          <next>
            <block type="iot_set_interval">
              <field name="SECONDS">3</field>
              <statement name="DO">
                <block type="iot_log">
                  <value name="VALUE">
                    <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                  </value>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>`
    },
    {
      id: 'sensor-alert',
      name: '3. Threshold Alert',
      xml: `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="iot_connect" x="50" y="50">
          <next>
            <block type="iot_set_interval">
              <field name="SECONDS">2</field>
              <statement name="DO">
                <block type="controls_if">
                  <value name="IF0">
                    <block type="logic_compare">
                      <field name="OP">GT</field>
                      <value name="A">
                        <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                      </value>
                      <value name="B">
                        <block type="math_number"><field name="NUM">${thresholdVal}</field></block>
                      </value>
                    </block>
                  </value>
                  <statement name="DO0">
                    <block type="iot_log">
                      <value name="VALUE"><shadow type="text"><field name="TEXT">${alertMsg}</field></shadow></value>
                    </block>
                  </statement>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>`
    },
    {
      id: 'lifecycle-demo',
      name: '4. Full Lifecycle Demo',
      xml: `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="iot_connect" x="50" y="50">
          <next>
            <block type="iot_set_interval">
              <field name="SECONDS">2</field>
              <statement name="DO">
                <block type="iot_log">
                  <value name="VALUE"><shadow type="text"><field name="TEXT">Checking ${sensorName} limit...</field></shadow></value>
                  <next>
                    <block type="controls_if">
                      <value name="IF0">
                        <block type="logic_compare">
                          <field name="OP">GT</field>
                          <value name="A">
                            <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                          </value>
                          <value name="B">
                            <block type="math_number"><field name="NUM">${thresholdVal}</field></block>
                          </value>
                        </block>
                      </value>
                      <statement name="DO0">
                        <block type="iot_log">
                          <value name="VALUE"><shadow type="text"><field name="TEXT">${critMsg}</field></shadow></value>
                          <next>
                            <block type="iot_restart_device">
                              <next>
                                <block type="iot_disconnect"></block>
                              </next>
                            </block>
                          </next>
                        </block>
                      </statement>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>`
    },
    {
      id: 'master-replica',
      name: `5. ${sensorName} Master Replica`,
      xml: masterReplicaXml
    },
    {
      id: 'build-animation',
      name: '6. Build Your Own Animation!',
      xml: `<xml xmlns="https://developers.google.com/blockly/xml">
        <block type="iot_connect" x="50" y="50">
          <next>
            <block type="iot_set_interval">
              <field name="SECONDS">1</field>
              <statement name="DO">
                <block type="ui_set_height">
                  <value name="VALUE">
                    <block type="math_arithmetic">
                      <field name="OP">MULTIPLY</field>
                      <value name="A">
                        <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                      </value>
                      <value name="B">
                        <block type="math_number"><field name="NUM">2</field></block>
                      </value>
                    </block>
                  </value>
                  <next>
                    <block type="controls_if">
                      <mutation else="1"></mutation>
                      <value name="IF0">
                        <block type="logic_compare">
                          <field name="OP">GT</field>
                          <value name="A">
                            <block type="iot_get_sensor"><field name="SENSOR_TYPE">${primaryType}</field></block>
                          </value>
                          <value name="B">
                            <block type="math_number"><field name="NUM">${thresholdVal}</field></block>
                          </value>
                        </block>
                      </value>
                      <statement name="DO0">
                        <block type="ui_set_color">
                          <value name="COLOR"><block type="colour_picker"><field name="COLOUR">#ff0000</field></block></value>
                          <next>
                            <block type="ui_set_text">
                              <value name="TEXT"><shadow type="text"><field name="TEXT">HIGH!</field></shadow></value>
                            </block>
                          </next>
                        </block>
                      </statement>
                      <statement name="ELSE">
                        <block type="ui_set_color">
                          <value name="COLOR"><block type="colour_picker"><field name="COLOUR">#33ccff</field></block></value>
                          <next>
                            <block type="ui_set_text">
                              <value name="TEXT"><shadow type="text"><field name="TEXT">Normal</field></shadow></value>
                            </block>
                          </next>
                        </block>
                      </statement>
                    </block>
                  </next>
                </block>
              </statement>
            </block>
          </next>
        </block>
      </xml>`
    }
  ];
}
