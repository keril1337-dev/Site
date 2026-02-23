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
      let top = pageY - rect_zone.top - shiftX;

      
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


function create_veriable(){
  var skibidi = document.createElement("div");

  skibidi.id = `${count}`;
  skibidi.style.position = "absolute";

  skibidi.innerHTML = ` <img src="program_sector_img/declaring_variable_block.svg"
  width="250"
  height="150">
  
  <input type="text" 
  name="name" 
  maxlength="8"
  size="8"
  placeholder="Переменная"
  style="position: absolute; right: 80px; bottom: 70px">

  <button type="button"
  alt=""
  id = "delete${count}"
  width="32px"
  height="32px"
  style="position: absolute; right: 20px; bottom: 70px;">
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

document.getElementById("create-variable").addEventListener("click", create_veriable);