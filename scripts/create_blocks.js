let count = 0;
let count_if_true = 0;
let count_if_false = 0;
let count_while = 0;
let current_cycle_step = ["program-sector-without-cycles-id"];

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

  const obj_x_bottom = coord.left + dict_merge[`${object.dataset.name}_x_bottom`];
  const obj_y_bottom = coord.top + dict_merge[`${object.dataset.name}_y_bottom`];
  const obj_x_top = coord.left + dict_merge[`${object.dataset.name}_x_top`];
  const obj_y_top = coord.top + dict_merge[`${object.dataset.name}_y_top`];
  
  let flag = 0;

  elements.forEach(element => {
    if (element === object || element.classList.contains('block') == false || flag == 1){
      return;
    }

    const coord_cur_element = element.getBoundingClientRect();

    const cur_element_bottom_x = coord_cur_element.left + dict_merge[`${element.dataset.name}_x_bottom`];
    const cur_element_bottom_y = coord_cur_element.top + dict_merge[`${element.dataset.name}_y_bottom`];
    const cur_element_top_x = coord_cur_element.left + dict_merge[`${element.dataset.name}_x_top`];
    const cur_element_top_y = coord_cur_element.top + dict_merge[`${element.dataset.name}_y_top`];

    const check_top = Math.sqrt((obj_x_top - cur_element_bottom_x) ** 2 + (obj_y_top - cur_element_bottom_y) ** 2);
    const check_bottom = Math.sqrt((obj_x_bottom - cur_element_top_x) ** 2 + (obj_y_bottom - cur_element_top_y) ** 2);

    if (check_top < 35) {
      element.appendChild(object);

      const objVstupX = dict_merge[`${object.dataset.name}_vstup_x`];
      const objVstupY = dict_merge[`${object.dataset.name}_vstup_y`];
      const elVistupX = dict_merge[`${element.dataset.name}_vistup_x`];
      const elVistupY = dict_merge[`${element.dataset.name}_vistup_y`];

      const Left = elVistupX - objVstupX;
      const Top = elVistupY;

      object.style.left = Left + "px";
      object.style.top = Top + "px";

      flag = 1;
    }
    else if (check_bottom < 35){
      object.appendChild(element);

      const objVstupX = dict_merge[`${object.dataset.name}_vistup_x`];
      const objVstupY = dict_merge[`${object.dataset.name}_vistup_y`];
      const elVistupX = dict_merge[`${element.dataset.name}_vstup_x`];
      const elVistupY = dict_merge[`${element.dataset.name}_vstup_y`];

      const Left = objVstupX - elVistupX;
      const Top = objVstupY;

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
    check_childrens(variable_block);
    variable_block.remove();
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
  id = "togler_out${local_while}"
  type="button">
  Х
  </button>"`

  while_block.innerHTML = ` <img src="program_sector_img/while.svg"
  style="width: 300px; height: auto; position: absolute">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  style="left: 250px; top: 75px; height: 21px; position: absolute">
  X
  </button>

  <button type="button"
  class="button"
  alt=""
  id = "togler_in${local_while}"
  style="left: 60px; top: 85px; height: 50px; width: 160px; position: absolute">
  Изменить
  </button>`

  document.getElementById(current_cycle_step.at(-1)).appendChild(while_block);
  document.getElementById("program-sector-id").appendChild(while_change_zone);

  move_object(while_block.id);
  
  const changeBtn = document.querySelector(`#togler_in${local_while}`);
  const deleteBtn = while_block.querySelector(`#delete${count}`);
  const backBtn = document.getElementById(`togler_out${local_while}`);

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

function create_operation() {
  const create_operation_block = document.createElement("div");

  create_operation_block.id = `${count}`;
  create_operation_block.style.position = "absolute";
  create_operation_block.classList.add("block");
  create_operation_block.dataset.name = "operation";

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
  
  const deleteBtn = create_operation_block.querySelector(`#delete${count}`);

  deleteBtn.onclick = function(event) {
    check_childrens(create_operation);
    create_operation_block.remove();
  };

  console.log(count);
  count+=1;
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
    check_childrens(create_output);
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

document.getElementById("create-begin").addEventListener("click", create_begin);
document.getElementById("create-variable").addEventListener("click", create_veriable);
document.getElementById("create-variable-edit").addEventListener("click", create_veriable_edit);
document.getElementById("create-if-else").addEventListener("click", create_if_else);
document.getElementById("create-while").addEventListener("click", create_while);
document.getElementById("create-operation").addEventListener("click", create_operation);
document.getElementById("create-output").addEventListener("click", create_output);
document.getElementById("create-end").addEventListener("click", create_end);