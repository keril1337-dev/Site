let count = 0;

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
  var begin_block = document.createElement("div");
  alert("хуй");

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

  document.getElementById("program-sector-without-cycles-id").appendChild(begin_block);
  document.getElementById("create-begin").disabled = true;
  move_object(begin_block.id);
  
  let deleteBtn = begin_block.querySelector(`#delete${count}`);

  
  deleteBtn.onmousedown = function(event) {
    event.stopPropagation(); 
  };

  deleteBtn.onclick = function(event) {
    begin_block.remove();
    document.getElementById("create-begin").disabled = false;
  };

  console.log(count);
  count+=1;

}

function create_veriable(){
  var variable_block = document.createElement("div");

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

  document.getElementById("program-sector-without-cycles-id").appendChild(variable_block);
  move_object(variable_block.id);
  
  let deleteBtn = variable_block.querySelector(`#delete${count}`);
  
  deleteBtn.onmousedown = function(event) {
    event.stopPropagation(); 
  };

  deleteBtn.onclick = function(event) {
    variable_block.remove();
  };

  console.log(count);
  count+=1;
}

function create_veriable_edit() {
  var variable_edit_block = document.createElement("div");

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

  document.getElementById("program-sector-without-cycles-id").appendChild(variable_edit_block);
  move_object(variable_edit_block.id);
  
  let deleteBtn = variable_edit_block.querySelector(`#delete${count}`);
  
  deleteBtn.onmousedown = function(event) {
    event.stopPropagation(); 
  };

  deleteBtn.onclick = function(event) {
    variable_edit_block.remove();
  };

  console.log(count);
  count+=1;
}

function hide() {
  sector = document.querySelector(".program-sector-without-cycles");
  if (sector.classList.contains("hide")){
    sector.classList.remove("hide");
  }
  else {
    sector.classList.add("hide");
  }
}

document.getElementById("togler").addEventListener("click", hide);
document.getElementById("create-begin").addEventListener("click", create_begin);
document.getElementById("create-variable").addEventListener("click", create_veriable);
document.getElementById("create-variable-edit").addEventListener("click", create_veriable_edit);

