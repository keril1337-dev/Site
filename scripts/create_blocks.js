let count = 0;
let count_if_true = 0;
let count_if_false = 0;
let count_while = 0;
let current_cycle_step = ["program-sector-without-cycles-id"];

function move_object(idd) {
  const object = document.getElementById(idd);
  const zone = document.getElementById("program-sector-id");

  object.onmousedown = function(event) {
    rect_zone = zone.getBoundingClientRect();
    rect_obj = object.getBoundingClientRect();

    shiftX = event.clientX - rect_obj.left;
    shiftY = event.clientY - rect_obj.top;

    function moveAt(pageX, pageY) {
      let left = pageX - rect_zone.left - shiftX;
      let top = pageY - rect_zone.top - shiftY;

      left = Math.max(0, Math.min(left, zone.offsetWidth - object.offsetWidth));
      top = Math.max(0, Math.min(top, zone.offsetHeight - object.offsetHeight));

      object.style.left = left + 'px';
      object.style.top = top + 'px';
    }

    function onMouseMove(event) {
      moveAt(event.clientX, event.clientY);
    }

    document.addEventListener('mousemove', onMouseMove);

    document.addEventListener('mouseup', function onMouseUp() {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    });
  };

  object.ondragstart = function() {
    return false;
  };
};

function create_begin(){
  let begin_block = document.createElement("div");

  begin_block.id = `${count}`;
  begin_block.style.position = "absolute";
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
  
  let deleteBtn = begin_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    begin_block.remove();
    document.getElementById("create-begin").disabled = false;
  };

  console.log(count);
  count+=1;
}

function create_veriable(){
  let variable_block = document.createElement("div");

  variable_block.id = `${count}`;
  variable_block.style.position = "absolute";
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
  
  let deleteBtn = variable_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    variable_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_veriable_edit() {
  let variable_edit_block = document.createElement("div");

  variable_edit_block.id = `${count}`;
  variable_edit_block.style.position = "absolute";
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
  
  let deleteBtn = variable_edit_block.querySelector(`#delete${count}`);
  
  deleteBtn.onclick = function(event) {
    variable_edit_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_if_else(){
  let local_if_id_true = count_if_true;
  let local_if_id_false = count_if_false;
  
  let if_else_block = document.createElement("div");
  let if_else_block_true = document.createElement("div");
  let if_else_block_false = document.createElement("div");

  if_else_block_true.id = `true${local_if_id_true}`;
  if_else_block_true.classList.add("hide");
  if_else_block_false.id = `false${local_if_id_false}`;
  if_else_block_false.classList.add("hide");

  if_else_block.id = `${count}`;
  if_else_block.style.position = "absolute";

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
  style="width: 450px; height: auto">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="left: 300px; bottom: 90px; height: 21px">
  X
  </button>

  <button type="button"
  class="button"
  alt=""
  id = "if-true${count_if_true}"
  style="left: 85px; bottom: 130px; height: 21px">
  Изменить
  </button>

  <button type="button"
  class="button"
  alt=""
  id = "if-false${count_if_false}"
  style="left: 190px; bottom: 58px; height: 21px">
  Изменить
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(if_else_block);
  document.getElementById("program-sector-id").appendChild(if_else_block_true);
  document.getElementById("program-sector-id").appendChild(if_else_block_false);

  move_object(if_else_block.id);
  
  let ifTrueBtn = document.querySelector(`#if-true${count_if_true}`);
  let ifFalseBtn = document.querySelector(`#if-false${count_if_false}`);

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

  let deleteBtn = if_else_block.querySelector(`#delete${count}`);
  let backTrueBtn = document.getElementById(`togler_t${local_if_id_true}`);
  let backFalseBtn = document.getElementById(`togler_f${local_if_id_false}`);
  
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
    if_else_block.remove();
  };

  console.log(count);
  count+=1;
  count_if_true+=1;
  count_if_false+=1;
}

function create_while(){
  let local_while = count_while;
  
  let while_block = document.createElement("div");
  let while_change_zone = document.createElement("div");

  while_change_zone.id = `while${local_while}`;
  while_change_zone.classList.add("hide");

  while_block.id = `${count}`;
  while_block.style.position = "absolute";

  while_change_zone.innerHTML = `<button 
  class="button"
  id = "togler_out${local_while}"
  type="button">
  Х
  </button>"`

  while_block.innerHTML = ` <img src="program_sector_img/while.svg"
  style="width: 500px; height: auto">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="left: 320px; bottom: 110px; height: 21px">
  X
  </button>

  <button type="button"
  class="button"
  alt=""
  id = "togler_in${local_while}"
  style="left: 140px; bottom: 80px; height: 40px; width: 160px">
  Изменить
  </button>`

  document.getElementById(current_cycle_step.at(-1)).appendChild(while_block);
  document.getElementById("program-sector-id").appendChild(while_change_zone);

  move_object(while_block.id);
  
  let changeBtn = document.querySelector(`#togler_in${local_while}`);

  changeBtn.onmousedown = function(event) {
    event.stopPropagation();
  }

  changeBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.push(`while${local_while}`);
    document.getElementById(`while${local_while}`).classList.remove("hide");
  }

  let deleteBtn = while_block.querySelector(`#delete${count}`);
  let backBtn = document.getElementById(`togler_out${local_while}`);

  backBtn.onclick = function(event) {
    document.getElementById(current_cycle_step.at(-1)).classList.add("hide");
    current_cycle_step.pop();
    document.getElementById(current_cycle_step.at(-1)).classList.remove("hide");
  }

  deleteBtn.onclick = function(event) {
    while_block.remove();
  };

  console.log(count);
  count+=1;
  count_while+=1;
}

function create_operation() {
  let create_operation_block = document.createElement("div");

  create_operation_block.id = `${count}`;
  create_operation_block.style.position = "absolute";

  create_operation_block.innerHTML = ` <img src="program_sector_img/operation.svg"
  style="width: 240px; height: auto">
  
  <input type="text"
  class="block-input" 
  name="name" 
  maxlength="8"
  size="8"
  style="right: 127px; bottom: 38px; width: 55px; height: 25px">
  
  <select name="operations" id="operations${count}"
  style="position: absolute; left: 110px; top: 40px">
    <option value="=="> == </option>
    <option value="=="> < </option>
    <option value="=="> > </option>
    <option value="=="> <= </option>
    <option value="=="> >= </option>
  </select>

  <input type="text"
  class="block-input" 
  name="name" 
  style="right: 25px; bottom: 38px; width: 55px; height: 25px">

  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="right: 8px; bottom: 85px; height: 21px">
  X
  </button>`;

  document.getElementById(current_cycle_step.at(-1)).appendChild(create_operation_block);
  move_object(create_operation_block.id);
  
  let deleteBtn = create_operation_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    create_operation_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_end() {
  let create_end_block = document.createElement("div");

  create_end_block.id = `${count}`;
  create_end_block.style.position = "absolute";

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
  
  let deleteBtn = create_end_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    create_end_block.remove();
  };

  console.log(count);
  count+=1;
}

document.getElementById("create-begin").addEventListener("click", create_begin);
document.getElementById("create-variable").addEventListener("click", create_veriable);
document.getElementById("create-variable-edit").addEventListener("click", create_veriable_edit);
document.getElementById("create-if-else").addEventListener("click", create_if_else);
document.getElementById("create-while").addEventListener("click", create_while);
document.getElementById("create-operation").addEventListener("click", create_operation);
document.getElementById("create-end").addEventListener("click", create_end);