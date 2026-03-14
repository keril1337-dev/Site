let count = 0;
let count_if_true = 0;
let count_if_false = 0;
let count_while = 0;
let count_for = 0;
let current_cycle_step = ["program-sector-without-cycles-id"];
let size_coef = 1;

class ScratchInterpreter {
  constructor() {
    this.vars = new Map();
    this.arrays = new Map();
    this.console = document.getElementById("output-console");
    this.max_iterations = 5000;

    this.priority = {
      '||': 1, '&&': 2,
      '==': 3, '!=': 3,
      '>': 4, '<': 4, '>=': 4, '<=': 4,
      '+': 5, '-': 5,
      '*': 6, '/': 6, '%': 6,
      '!': 7, 'index': 8 
    };
  }

  tokenize(str) {
    const tokens = [];
    let i = 0;
    function isWhitespace(c) {
      return (c === " " || c === "\n" || c === "\t" || c === "\r");
    }

    function isDigit(c){
      return (c >= "0" && c <= "9");
    }

    function isLetter(c){
      return (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_";
    }

    function isAlphaNumeric(c) {
      return isLetter(c) || isDigit(c);
    }

    while (i < str.length) {
      let char = str[i];

      if (isWhitespace(char)) { 
        i += 1; 
        continue; 
      }

      if (isDigit(char)) {
        let num = "";

        while (i < str.length && isDigit(str[i])) {
          num += str[i];
          i += 1;
        }

        tokens.push({ type: "NUM", value: parseInt(num) });
        continue;
      }

      if (isLetter(char)) {
        let name = "";

        while (i < str.length && isAlphaNumeric(str[i])) {
          name += str[i];
          i += 1;
        }

        tokens.push({ type: "VAR", value: name });
        continue;
      }

      const simpleOps = ["+", "-", "*", "/", "%", "(", ")", "[", "]"];
      if (simpleOps.includes(char)) {
        tokens.push({ type: "OP", value: char });
        i +=  1;
        continue;
      }

      const complexOps = ["==", "!=", ">=", "<=", "&&", "||"];
      let doubleChar = char + (str[i + 1] || "");
            
      if (complexOps.includes(doubleChar)) {
        tokens.push({ type: "OP", value: doubleChar });
          i += 2;
        } 
        else if ([">", "<", "!"].includes(char)) {
          tokens.push({ type: 'OP', value: char });
          i += 1;
        } 
        else { 
          i  += 1; 
        }
      }
    return tokens;
  }

  shuntingYard(tokens) {
    const output = [];
    const stack = [];
    tokens.forEach((token) => {
      if (token.type === 'NUM' || token.type === 'VAR') {
        output.push(token);
      } 
      else if (token.value === '(' || token.value === '[') {
        stack.push(token);
      } 
      else if (token.value === ')') {
        while (stack.length && stack[stack.length - 1].value !== '('){
          output.push(stack.pop());
        }
        stack.pop();
        
      } 
      else if (token.value === ']') {
        while (stack.length && stack[stack.length - 1].value !== '[') {
          output.push(stack.pop());
        }
        stack.pop();
        output.push({ type: 'OP', value: 'index' });
        
      } 
      else {
        while (stack.length && this.priority[stack[stack.length - 1].value] >= this.priority[token.value]) {
          output.push(stack.pop());
        }
        stack.push(token);
      }
    });

    while (stack.length) output.push(stack.pop());
    return output;
  }

  evaluate(str) {
    if (!str || str.trim() === ""){
      return 0;
    }

    const tokens = this.tokenize(str);
    const rpn = this.shuntingYard(tokens);
    const stack = [];

    rpn.forEach(token => {
      if (token.type === 'NUM') {
        stack.push(token.value);
      } 
      else if (token.type === 'VAR') {
        stack.push(token.value); 
      } 
      else {
        if (token.value === '!') {
          let v = this.getVal(stack.pop());
          stack.push(v ? 0 : 1);
        } 
        else if (token.value === 'index') {
          let idx = this.getVal(stack.pop());
          let name = stack.pop(); 
          if (!this.arrays.has(name)) {
            throw new Error(`Массив "${name}" не найден`);
          }
          let val = this.arrays.get(name)[idx];
          stack.push(val !== undefined ? val : 0);
        } 
        else {
          let b = this.getVal(stack.pop());
          let a = this.getVal(stack.pop());
          switch (token.value) {
            case '+': stack.push(a + b); break;
            case '-': stack.push(a - b); break;
            case '*': stack.push(a * b); break;
            case '/': stack.push(b === 0 ? 0 : Math.trunc(a / b)); break;
            case '%': stack.push(b === 0 ? 0 : a % b); break;
            case '==': stack.push(a === b ? 1 : 0); break;
            case '!=': stack.push(a !== b ? 1 : 0); break;
            case '>': stack.push(a > b ? 1 : 0); break;
            case '<': stack.push(a < b ? 1 : 0); break;
            case '>=': stack.push(a >= b ? 1 : 0); break;
            case '<=': stack.push(a <= b ? 1 : 0); break;
            case '&&': stack.push((a && b) ? 1 : 0); break;
            case '||': stack.push((a || b) ? 1 : 0); break;
          }
        }
      }
    });
    return this.getVal(stack[0]);
  }

  getVal(v) {
    if (typeof v === "string") {
      if (this.vars.has(v)){
        return this.vars.get(v);
      }
      throw new Error(`Переменная "${v}" не определена`);
    }
    return v;
  }

  async run() {
    this.console.innerHTML = "<div>Запуск</div>";
    this.vars.clear();
    this.arrays.clear();

    try {
      document.querySelectorAll('.block').forEach(b => {
        const inp = b.querySelector('input[name="name"]');
        if (!inp) {
          return;
        }
        const name = inp.value.trim();
        if (!name){ 
          return;
        }
        if (b.dataset.name === 'variable-create') {
          this.vars.set(name, 0);
        }
        if (b.dataset.name === 'array-create') {
          this.arrays.set(name, []);
        }
      });

      const begin = Array.from(document.querySelectorAll(".block"));
      let begin_true = null;

      begin.forEach(element =>{
        if (element.dataset.name === "begin"){
          begin_true = document.getElementById(element.id);
        }
      });
      if (!begin_true){
        throw new Error("Программа должна начинаться с begin");
      } 

      let end_found = false;
      let check = begin_true.querySelectorAll(".block");
      let flag = 1;
      let first_block = null;

      check.forEach(element => {
        if (flag ==  1){
          first_block = element;
          flag = 0;
        }
        if (element.dataset.name === "end"){
          end_found = true;
        }
      });

      if (!end_found) {
        throw new Error("Программа должна заканчиваться блоком 'end'");
      }
      
      if (first_block){ 
        await this.executeChain(first_block);
      }
      this.log("Выполнение завершено.", "#888");
    } 
    catch (e) {
      this.log(`[ОШИБКА]: ${e.message}`, "#ff4d4d");
    }
  }

  async executeChain(block) {
    while (block && block.dataset.name !== 'end') {
      const inputs = block.querySelectorAll('input');
      const type = block.dataset.name;

      if (type === 'variable-edit') {
        const nameInput = inputs[0].value.trim();
        const val = this.evaluate(inputs[1].value);
                
        let isArrayAccess = false;
        let arrName = "";
        let idxStr = "";

        if (nameInput.endsWith(']')) {
          const openBracketIdx = nameInput.indexOf('[');
          if (openBracketIdx !== -1) {
            isArrayAccess = true;
            arrName = nameInput.substring(0, openBracketIdx).trim();
            idxStr = nameInput.substring(openBracketIdx + 1, nameInput.length - 1).trim();
          }
        }
                
        if (isArrayAccess) {
          if (!this.arrays.has(arrName)) {
            throw new Error(`Массив "${arrName}" не найден. Убедитесь, что создали его `);
          }
                    
          const idx = this.evaluate(idxStr);
          const arr = this.arrays.get(arrName);
                      
          if (idx < 0 || idx >= arr.length) {
            throw new Error(`Индекс ${idx} вне границ массива ${arrName}`);
          }
                      
          arr[idx] = val;
        } 
        else {
          if (!this.vars.has(nameInput)) {
            throw new Error(`Переменная "${nameInput}" не заведена`);
          }
          this.vars.set(nameInput, val);
        }
      }
      else if (type === 'output') {
        this.log(`> ${this.evaluate(inputs[0].value)}`);
      } 
      else if (type === 'change-array') {
        const name = inputs[0].value.trim();
        const action = block.querySelector('select').value;
        const val = this.evaluate(inputs[1].value);
                
        if (!this.arrays.has(name)){
          throw new Error(`Массив "${name}" не заведен`);
        }
                
        const arr = this.arrays.get(name);
        if (action.includes("Добавить")) {
          arr.push(val);
        } 
        else {
          if (val >= 0 && val < arr.length) arr.splice(val, 1);
          else{ 
            throw new Error(`Индекс ${val} вне границ массива ${name}`);
          }
        }
    } 
    else if (type === 'if-else') {
      const cond = this.evaluate(inputs[0].value);
      const trueId = block.querySelector('[id^="if-true"]').id.replace('if-true', 'true');
      const falseId = block.querySelector('[id^="if-false"]').id.replace('if-false', 'false');
      const container = document.getElementById(cond ? trueId : falseId);
      const inner = Array.from(container.children).find(c => c.classList.contains('block'));
      if (inner){
        await this.executeChain(inner);
      }
    } 
    else if (type === 'while') {
      const condStr = inputs[0].value;
      const contId = block.querySelector('[id^="togler_in_"]').id.replace('togler_in_', '');
      const container = document.getElementById(contId);
      const inner = Array.from(container.children).find(c => c.classList.contains('block'));

      const executeWhile = async (safety = 0) => {
        if (!this.evaluate(condStr)){ 
          return;
        }
        if (safety > this.max_iterations){
          throw new Error("Бесконечный цикл");
        }
                    
        if (inner) {
          await this.executeChain(inner);
        }
                    
        await executeWhile(safety + 1);
      };

      await executeWhile(0);
    }
    else if (type === 'for') {
      const counter = inputs[0].value.trim();
      const limit = this.evaluate(inputs[1].value);
      const contId = block.querySelector('[id^="togler_in_"]').id.replace('togler_in_', '');
      const container = document.getElementById(contId);
      const inner = Array.from(container.children).find(c => c.classList.contains('block'));

      const executeFor = async (i) => {
        if (i >= limit) return; 
                    
        this.vars.set(counter, i);
          if (inner) {
            await this.executeChain(inner);
          }
                    
        await executeFor(i + 1);
      };

      await executeFor(0);
    }

    block = Array.from(block.children).find(c => c.classList.contains('block'));
    }
  }

  log(msg, color = "#00ff00") {
    const div = document.createElement("div");
    div.style.color = color;
    div.textContent = msg;
    this.console.appendChild(div);
    this.console.scrollTop = this.console.scrollHeight;
  }
}

document.getElementById('run-btn').addEventListener('click', () => {
    new ScratchInterpreter().run();
});

function check_childrens(object){
  if (object.children.length == 0){
    return;
  }
  else {
    const elements = Array.from(object.children);
    const zone = document.getElementById(current_cycle_step.at(-1));
    elements.forEach(element => {
      if (element.classList.contains("block")){
        const rect_zone = zone.getBoundingClientRect();
        const rect_element= element.getBoundingClientRect();

        zone.appendChild(element);

        element.style.left = (rect_element.left - rect_zone.left) +  "px";
        element.style.top = (rect_element.top - rect_zone.top) + "px";
      }
    });
  }
}

function merge(idd){
  const object = document.getElementById(idd);
  const current_sector = document.querySelector(`#${current_cycle_step.at(-1)}`);
  const elements = current_sector.querySelectorAll(".block");
  const coord = object.getBoundingClientRect();

  const obj_x_bottom = coord.left * size_coef + dict_merge[`${object.dataset.name}_x_bottom`] * size_coef;
  const obj_y_bottom = coord.top * size_coef + dict_merge[`${object.dataset.name}_y_bottom`] * size_coef;
  const obj_x_top = coord.left * size_coef + dict_merge[`${object.dataset.name}_x_top`] * size_coef;
  const obj_y_top = coord.top * size_coef + dict_merge[`${object.dataset.name}_y_top`] * size_coef;
  
  let flag = 0;

  elements.forEach(element => {
    if (element === object || element.classList.contains('block') == false || flag == 1){
      return;
    }

    const coord_cur_element = element.getBoundingClientRect();
    const cur_element_bottom_x = coord_cur_element.left * size_coef + dict_merge[`${element.dataset.name}_x_bottom`] * size_coef;
    const cur_element_bottom_y = coord_cur_element.top * size_coef + dict_merge[`${element.dataset.name}_y_bottom`] * size_coef;
    const cur_element_top_x = coord_cur_element.left * size_coef + dict_merge[`${element.dataset.name}_x_top`]
     * size_coef;
    const cur_element_top_y = coord_cur_element.top * size_coef + dict_merge[`${element.dataset.name}_y_top`]
     * size_coef;

    const check_top = Math.sqrt((obj_x_top - cur_element_bottom_x) ** 2 + (obj_y_top - cur_element_bottom_y) ** 2);
    const check_bottom = Math.sqrt((obj_x_bottom - cur_element_top_x) ** 2 + (obj_y_bottom - cur_element_top_y) ** 2);

    console.log(`${check_bottom}, ${check_top}, ${window.innerHeight}, ${size_coef}`);

    if (check_top < 35 * size_coef) {
      element.appendChild(object);

      const objVstupX = dict_merge[`${object.dataset.name}_vstup_x`];
      const objVstupY = dict_merge[`${object.dataset.name}_vstup_y`];
      const elVistupX = dict_merge[`${element.dataset.name}_vistup_x`];
      const elVistupY = dict_merge[`${element.dataset.name}_vistup_y`];

      const Left = (elVistupX - objVstupX) * size_coef;
      const Top = elVistupY * size_coef;

      object.style.left = Left + "px";
      object.style.top = Top + "px";

      flag = 1;
    }
    else if (check_bottom < 35 * size_coef){
      object.appendChild(element);

      const objVstupX = dict_merge[`${object.dataset.name}_vistup_x`];
      const objVstupY = dict_merge[`${object.dataset.name}_vistup_y`];
      const elVistupX = dict_merge[`${element.dataset.name}_vstup_x`];
      const elVistupY = dict_merge[`${element.dataset.name}_vstup_y`];

      const Left = (objVstupX - elVistupX) * size_coef;
      const Top = objVstupY * size_coef;

      element.style.left = Left + "px";
      element.style.top = Top + "px";

      flag = 1;
    }
  });
}

function move_object(idd) {
  const object = document.getElementById(idd);
  const zone = document.getElementById(current_cycle_step.at(-1));

  object.onmousedown = function(event) {
    if (event.target.tagName === 'INPUT' || 
      event.target.tagName === 'SELECT' || 
      event.target.tagName === 'BUTTON') {
      return;
    }

    event.stopPropagation();

    if (object.parentElement && object.parentElement.classList.contains("block")) {
        const rect_obj = object.getBoundingClientRect();
        zone.appendChild(object);

        const zone_rect = zone.getBoundingClientRect();
        object.style.left = (rect_obj.left - zone_rect.left) + "px";
        object.style.top = (rect_obj.top - zone_rect.top) + "px";
    }

    const rect_zone = zone.getBoundingClientRect();
    const rect_obj = object.getBoundingClientRect();

    const shiftX = event.clientX - rect_obj.left;
    const shiftY = event.clientY - rect_obj.top;

    function moveAt(pageX, pageY) {
      let left = pageX - rect_zone.left - shiftX;
      let top = pageY - rect_zone.top - shiftY;

      left = Math.max(0, Math.min(left, zone.offsetWidth - object.offsetWidth));
      top = Math.max(0, Math.min(top, zone.offsetHeight - object.offsetHeight));

      object.style.left = left + "px";
      object.style.top = top + "px";
    }

    function onMouseMove(event) {
      moveAt(event.clientX, event.clientY);
    }

    document.addEventListener("mousemove", onMouseMove);

    document.addEventListener("mouseup", function onMouseUp() {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      merge(idd);
    });
  };

  object.ondragstart = function() {
    return false;
  };
};

function create_begin(){
  const begin_block = document.createElement("div");

  begin_block.id = `${count}`;
  begin_block.style.position = "absolute";
  begin_block.classList.add("block");
  begin_block.dataset.name = "begin";

  begin_block.innerHTML = ` <img src="program_sector_img/begin.svg"
  style="width: 320px; height: auto">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  width="32px"
  height="32px"
  style="right: 4px; bottom: 25px; width: 30px; height: 20px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(begin_block);
  document.getElementById("create-begin").disabled = true;
  move_object(begin_block.id);
  
  const deleteBtn = begin_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    check_childrens(begin_block);
    begin_block.remove();
    document.getElementById("create-begin").disabled = false;
  };

  console.log(count);
  count+=1;
}

function create_veriable(){
  const variable_block = document.createElement("div");

  variable_block.id = `${count}`;
  variable_block.style.position = "absolute";
  variable_block.classList.add("block");
  variable_block.dataset.name = "variable-create";

  variable_block.innerHTML = ` <img src="program_sector_img/declaring-variable.svg"
  width="150"
  height="27"
  style="display: block">
  
  <input type="text"
  class="block-input" 
  name="name" 
  maxlength="8"
  size="8"
  style="right: 50px; bottom: 5px; width: 60px; height: 12px">

  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="right: 8px; bottom: 4px; height: 21px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(variable_block);
  move_object(variable_block.id);
  
  const deleteBtn = variable_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    variable_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_array(){
  const array_block = document.createElement("div");

  array_block.id = `${count}`;
  array_block.style.position = "absolute";
  array_block.classList.add("block");
  array_block.dataset.name = "array-create";

  array_block.innerHTML = ` <img src="program_sector_img/declaring-variable.svg"
  width="150"
  height="27"
  style="display: block">
  
  <input type="text"
  class="block-input" 
  name="name" 
  maxlength="8"
  size="8"
  style="right: 50px; bottom: 5px; width: 60px; height: 12px">

  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="right: 8px; bottom: 4px; height: 21px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(array_block);
  move_object(array_block.id);
  
  const deleteBtn = array_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    array_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_veriable_edit() {
  const variable_edit_block = document.createElement("div");

  variable_edit_block.id = `${count}`;
  variable_edit_block.style.position = "absolute";
  variable_edit_block.classList.add("block");
  variable_edit_block.dataset.name = "variable-edit";

  variable_edit_block.innerHTML = ` <img src="program_sector_img/variable-edit.svg"
  style="width: 500px; height: auto">
  
  <input type="text"
  class="block-input" 
  name="name" 
  maxlength="8"
  size="8"
  style="right: 205px; bottom: 42px; width: 105px; height: 25px">

  <input type="text"
  class="block-input" 
  name="name" 
  style="right: 35px; bottom: 42px; width: 105px; height: 25px">

  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="right: 8px; bottom: 85px; height: 21px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(variable_edit_block);
  move_object(variable_edit_block.id);
  
  const deleteBtn = variable_edit_block.querySelector(`#delete${count}`);
  
  deleteBtn.onclick = function(event) {
    check_childrens(variable_edit_block);
    variable_edit_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_change_array(){
  const change_array_block = document.createElement("div");

  change_array_block.id = `${count}`;
  change_array_block.style.position = "absolute";
  change_array_block.classList.add("block");
  change_array_block.dataset.name = "change-array";

  change_array_block.innerHTML = ` <img src="program_sector_img/change_array_zero.svg"
  style="width: 300px; height: auto">
  
  <input type="text"
  class="block-input" 
  name="name" 
  maxlength="8"
  size="8"
  style="right: 185px; bottom: 82px; width: 75px; height: 25px">

  <select name="choice" id="change-array-select"
  class="option-select"
  style="right: 30px; bottom: 132px; width: 160px">
    <option value="Удалить по индексу">Удалить по индексу</option>
    <option value="Добавить элемент">Добавить элемент</option>
  </select>

  <input type="text"
  class="block-input" 
  name="name" 
  style="right: 35px; bottom: 82px; width: 105px; height: 25px">

  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="right: 8px; bottom: 155px; height: 21px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(change_array_block);
  move_object(change_array_block.id);
  
  const deleteBtn = change_array_block.querySelector(`#delete${count}`);
  
  deleteBtn.onclick = function(event) {
    check_childrens(change_array_block);
    change_array_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_if_else(){
  const local_if_id_true = count_if_true;
  const local_if_id_false = count_if_false;
  
  const if_else_block = document.createElement("div");
  const if_else_block_true = document.createElement("div");
  const if_else_block_false = document.createElement("div");

  if_else_block_true.id = `true${local_if_id_true}`;
  if_else_block_true.classList.add("hide");
  if_else_block_false.id = `false${local_if_id_false}`;
  if_else_block_false.classList.add("hide");
  if_else_block.id = `${count}`;
  if_else_block.classList.add("block");

  if_else_block.style.position = "absolute";
  if_else_block.dataset.name = "if-else";

  if_else_block_true.innerHTML = `<button 
  class="button"
  id = "togler_t${local_if_id_true}"
  type="button">
  Х
  </button>"`

  if_else_block_false.innerHTML = `<button 
  class="button"
  id = "togler_f${local_if_id_false}"
  type="button">
  Х
  </button>"`

  if_else_block.innerHTML = ` <img src="program_sector_img/if-else.svg"
  style="width: 250px; height: auto">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="left: 200px; bottom: 140px; height: 21px">
  X
  </button>

  <button type="button"
  class="button"
  alt=""
  id = "if-true${count_if_true}"
  style="left: 15px; bottom: 115px; height: 21px">
  Изменить
  </button>

  <input type="text"
  class="block-input" 
  name="name" 
  style="right: 65px; bottom: 72px; width: 105px; height: 25px">

  <button type="button"
  class="button"
  alt=""
  id = "if-false${count_if_false}"
  style="left: 130px; bottom: 40px; height: 21px">
  Изменить
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(if_else_block);
  document.getElementById("program-sector-id").appendChild(if_else_block_true);
  document.getElementById("program-sector-id").appendChild(if_else_block_false);

  move_object(if_else_block.id);
  
  const ifTrueBtn = document.querySelector(`#if-true${count_if_true}`);
  const ifFalseBtn = document.querySelector(`#if-false${count_if_false}`);

  ifTrueBtn.onmousedown = function(event) {
    event.stopPropagation();
  }

  ifFalseBtn.onmousedown = function(event) {
    event.stopPropagation();
  }

  ifTrueBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.push(`true${local_if_id_true}`);
    document.getElementById(`true${local_if_id_true}`).classList.remove("hide");
  }

  ifFalseBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.push(`false${local_if_id_false}`);
    document.getElementById(`false${local_if_id_false}`).classList.remove("hide");
  }

  const deleteBtn = if_else_block.querySelector(`#delete${count}`);
  const backTrueBtn = document.getElementById(`togler_t${local_if_id_true}`);
  const backFalseBtn = document.getElementById(`togler_f${local_if_id_false}`);
  
  backTrueBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.pop();
    document.getElementById(current_cycle_step.at(-1)).classList.remove("hide");
  }

  backFalseBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.pop();
    document.getElementById(current_cycle_step.at(-1)).classList.remove("hide");
  }

  deleteBtn.onclick = function(event) {
    check_childrens(if_else_block);
    if_else_block.remove();
  };

  console.log(count);
  count += 1;
  count_if_true += 1;
  count_if_false += 1;
}

function create_while(){
  const local_while = count_while;
  
  const while_block = document.createElement("div");
  const while_change_zone = document.createElement("div");

  while_change_zone.id = `while${local_while}`;
  while_change_zone.classList.add("hide");
  while_block.id = `${count}`;
  while_block.classList.add("block");

  while_block.style.position = "absolute";
  while_block.dataset.name = "while";

  while_change_zone.innerHTML = `<button 
  class="button"
  id = "togler_out_while${local_while}"
  type="button">
  Х
  </button>`

  while_block.innerHTML = ` <img src="program_sector_img/while.svg"
  style="width: 300px; height: auto; position: absolute">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="left: 250px; top: 75px; height: 21px; position: absolute">
  X
  </button>

  <input type="text"
  class="block-input" 
  name="name" 
  style="left: 85px; top: 80px; width: 105px; height: 25px">

  <button type="button"
  class="button"
  alt=""
  id = "togler_in_while${local_while}"
  style="left: 60px; top: 115px; height: 30px; width: 160px; position: absolute">
  Изменить
  </button>`

  document.getElementById(current_cycle_step.at(-1)).appendChild(while_block);
  document.getElementById("program-sector-id").appendChild(while_change_zone);

  move_object(while_block.id);
  
  const changeBtn = document.querySelector(`#togler_in_while${local_while}`);
  const deleteBtn = while_block.querySelector(`#delete${count}`);
  const backBtn = document.getElementById(`togler_out_while${local_while}`);

  changeBtn.onmousedown = function(event) {
    event.stopPropagation();
  }

  deleteBtn.onmousedown = function(event) {
    event.stopPropagation();
  }

  changeBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.push(`while${local_while}`);
    document.getElementById(`while${local_while}`).classList.remove("hide");
  }

  backBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.pop();
    document.getElementById(current_cycle_step.at(-1)).classList.remove("hide");
  }

  deleteBtn.onclick = function(event) {
    check_childrens(while_block);
    while_block.remove();
  };

  console.log(count);
  count += 1;
  count_while += 1;
}

function create_for() {
  const local_for = count_for;
  
  const for_block = document.createElement("div");
  const for_change_zone = document.createElement("div");

  for_change_zone.id = `for${local_for}`;
  for_change_zone.classList.add("hide");
  for_block.id = `${count}`;
  for_block.classList.add("block");

  for_block.style.position = "absolute";
  for_block.dataset.name = "for";

  for_change_zone.innerHTML = `<button 
  class="button"
  id = "togler_out_for${local_for}"
  type="button">
  Х
  </button>`

  for_block.innerHTML = ` <img src="program_sector_img/for.svg"
  style="width: 300px; height: auto; position: absolute">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="left: 250px; top: 15px; height: 21px; position: absolute">
  X
  </button>

  <input type="text"
  class="block-input" 
  name="name" 
  style="left: 145px; top: 50px; width: 105px; height: 25px">

  <input type="text"
  class="block-input" 
  name="name" 
  style="left: 145px; top: 130px; width: 105px; height: 25px">

  <button type="button"
  class="button"
  alt=""
  id = "togler_in_for${local_for}"
  style="left: 60px; top: 95px; height: 25px; width: 160px; position: absolute">
  Изменить
  </button>`

  document.getElementById(current_cycle_step.at(-1)).appendChild(for_block);
  document.getElementById("program-sector-id").appendChild(for_change_zone);

  move_object(for_block.id);
  
  const changeBtn = document.querySelector(`#togler_in_for${local_for}`);
  const deleteBtn = for_block.querySelector(`#delete${count}`);
  const backBtn = document.getElementById(`togler_out_for${local_for}`);

  changeBtn.onmousedown = function(event) {
    event.stopPropagation();
  }

  deleteBtn.onmousedown = function(event) {
    event.stopPropagation();
  }

  changeBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.push(`for${local_for}`);
    document.getElementById(`for${local_for}`).classList.remove("hide");
  }

  backBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.pop();
    document.getElementById(current_cycle_step.at(-1)).classList.remove("hide");
  }

  deleteBtn.onclick = function(event) {
    check_childrens(for_block);
    for_block.remove();
  };

  console.log(count);
  count += 1;
  count_for += 1;
}


function create_output() {
  const create_output_block = document.createElement("div");

  create_output_block.id = `${count}`;
  create_output_block.style.position = "absolute";
  create_output_block.classList.add("block");
  create_output_block.dataset.name = "output";

  create_output_block.innerHTML = ` <img src="program_sector_img/output_zero.svg"
  style="width: 210px; height: auto">

  <input type="text"
  class="block-input" 
  name="name" 
  style="right: 60px; bottom: 38px; width:75px; height: 55px">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="right: 2px; bottom: 5px; height: 21px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(create_output_block);
  move_object(create_output_block.id);
  
  const deleteBtn = create_output_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    check_childrens(create_output_block);
    create_output_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_end() {
  const create_end_block = document.createElement("div");

  create_end_block.id = `${count}`;
  create_end_block.style.position = "absolute";
  create_end_block.classList.add("block");
  create_end_block.dataset.name = "end";

  create_end_block.innerHTML = ` <img src="program_sector_img/end.svg"
  style="width: 210px; height: auto">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="right: 2px; bottom: 5px; height: 21px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(create_end_block);
  move_object(create_end_block.id);
  
  const deleteBtn = create_end_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    check_childrens(create_end_block);
    create_end_block.remove();
  };

  console.log(count);
  count+=1;
}

document.getElementById('run-btn').addEventListener('click', () => {
  const interpreter = new ScratchInterpreter();
  interpreter.run();
});

document.getElementById("create-begin").addEventListener("click", create_begin);
document.getElementById("create-variable").addEventListener("click", create_veriable);
document.getElementById("create-array").addEventListener("click", create_array);
document.getElementById("create-variable-edit").addEventListener("click", create_veriable_edit);
document.getElementById("create-change-array").addEventListener("click", create_change_array);
document.getElementById("create-if-else").addEventListener("click", create_if_else);
document.getElementById("create-while").addEventListener("click", create_while);
document.getElementById("create-for").addEventListener("click", create_for);
document.getElementById("create-output").addEventListener("click", create_output);
document.getElementById("create-end").addEventListener("click", create_end);