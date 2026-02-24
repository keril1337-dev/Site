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
  console.log("1");

  begin_block.innerHTML = ` <img src="program_sector_img/begin.svg"
  width="200"
  height="50">
  
  <button type="button"
  class="button"
  alt=""
  id = "delete${count}"
  width="32px"
  height="32px"
  style="right: 4px; bottom: 25px; width: 30px; height: 20px">
  X
  </button>`;

  document.getElementById("program-sector-id").appendChild(begin_block);
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
  var skibidi = document.createElement("div");

  skibidi.id = `${count}`;
  skibidi.style.position = "absolute";

  skibidi.innerHTML = ` <img src="program_sector_img/declaring-variable.svg"
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

  console.log("23232");
  document.getElementById("program-sector-id").appendChild(skibidi);
  move_object(skibidi.id);
  
  let deleteBtn = skibidi.querySelector(`#delete${count}`);
  
  deleteBtn.onmousedown = function(event) {
    event.stopPropagation(); 
  };

  deleteBtn.onclick = function(event) {
    skibidi.remove();
  };

  console.log(count);
  count+=1;

}

document.getElementById("create-begin").addEventListener("click", create_begin);
document.getElementById("create-variable").addEventListener("click", create_veriable);
