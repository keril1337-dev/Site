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
    // Вспомогательные функции для проверки символов без регулярных выражений
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

      // Пропуск пробелов
      if (isWhitespace(char)) { 
        i += 1; 
        continue; 
      }

      // Парсинг чисел
      if (isDigit(char)) {
        let num = "";

        while (i < str.length && isDigit(str[i])) {
          num += str[i];
          i += 1;
        }

        tokens.push({ type: "NUM", value: parseInt(num) });
        continue;
      }

      // Парсинг переменных и массивов
      if (isLetter(char)) {
        let name = "";

        while (i < str.length && isAlphaNumeric(str[i])) {
          name += str[i];
          i += 1;
        }

        tokens.push({ type: "VAR", value: name });
        continue;
      }

      // Обработка операторов
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