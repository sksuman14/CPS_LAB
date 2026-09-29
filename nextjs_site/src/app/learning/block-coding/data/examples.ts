export const blocklyExamples = [
  {
    id: 'basic-move',
    name: 'Move & Stop',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="car_move" x="50" y="50">
        <field name="DIRECTION">F</field>
        <field name="DURATION">2</field>
        <next>
          <block type="car_stop"></block>
        </next>
      </block>
    </xml>`
  },
  {
    id: 'drive-square',
    name: 'Drive in a Square',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="controls_repeat_ext" x="50" y="50">
        <value name="TIMES">
          <shadow type="math_number">
            <field name="NUM">4</field>
          </shadow>
        </value>
        <statement name="DO">
          <block type="car_move">
            <field name="DIRECTION">F</field>
            <field name="DURATION">2</field>
            <next>
              <block type="car_move">
                <field name="DIRECTION">R</field>
                <field name="DURATION">0.5</field>
              </block>
            </next>
          </block>
        </statement>
      </block>
    </xml>`
  },
  {
    id: 'speed-control',
    name: 'Speed & Wait',
    xml: `<xml xmlns="https://developers.google.com/blockly/xml">
      <block type="car_set_speed" x="50" y="50">
        <field name="SPEED">200</field>
        <next>
          <block type="car_move">
            <field name="DIRECTION">F</field>
            <field name="DURATION">3</field>
            <next>
              <block type="car_set_speed">
                <field name="SPEED">100</field>
                <next>
                  <block type="car_move">
                    <field name="DIRECTION">B</field>
                    <field name="DURATION">3</field>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </xml>`
  }
];
