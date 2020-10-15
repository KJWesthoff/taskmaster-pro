var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
  // create elements that make up a task item
  var taskLi = $("<li>").addClass("list-group-item");
  
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(taskDate);
  var taskP = $("<p>").addClass("m-1").text(taskText);

  // append span and p element to parent li
  taskLi.append(taskSpan, taskP);

  auditTask(taskLi);

  // append to ul list on the page
  $("#list-" + taskList).append(taskLi);
};


var loadTasks = function() {
  tasks = JSON.parse(localStorage.getItem("tasks"));

  // if nothing in localStorage, create a new object to track all task status arrays
  if (!tasks) {
    tasks = {
      toDo: [],
      inProgress: [],
      inReview: [],
      done: []
    };
  }


  

  // loop over object properties
  $.each(tasks, function(list, arr) {
    //console.log(list, arr);
    // then loop over sub-array
    arr.forEach(function(task) {
      createTask(task.text, task.date, list);
    });
  });
};


var saveTasks = function() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};



// event listener on list p
$(".list-group").on("click", "p", function() {
  var text = $(this).text().trim();
  console.log(text);
  var textInput = $("<textarea>").addClass("form-control").val(text);
  $(this).replaceWith(textInput);
  textInput.trigger("focus");
});

// event listener on list-group blur happnes when user goes out of the text area
$(".list-group").on("blur", "textarea", function() {
// get current value/text
var text = $(this).val().trim()

//get id
var status = $(this).closest(".list-group").attr("id").replace("list-", "")

//position
var index = $(this).closest(".list-group-item").index()

tasks[status][index].text = text;
saveTasks();

//switch text area back to a p
var taskP = $("<p>").addClass("m-1").text(text);
$(this).replaceWith(taskP);


});


// click due date event listener
$(".list-group").on("click", "span", function(){
  // get the text
  var date = $(this).text().trim();

  //new date
  var dateInput = $("<input>").attr("type","text").addClass("form-control").val(date);

  $(this).replaceWith(dateInput);
  dateInput.datepicker({
    minDate: 1,
    onClose: function(){
      $(this).trigger("change");
    }

  });

  dateInput.trigger("focus");

});




//blur date eventlistener
$(".list-group").on("change", "input[type='text']",function(){
  
  // get items info text and where it belongs
  var date = $(this).val().trim();
  var status = $(this).closest(".list-group").attr("id").replace("list-", "");
  var index = $(this).closest(".list-group-item").index();

  // update and save tasks
  tasks[status][index].date = date;
  saveTasks();
  
  //recreate date as a span element with correct bootstrap class and replace input with span  
  var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
  $(this).replaceWith(taskSpan);

  // audit task
  auditTask($(taskSpan).closest(".list-group-item"));
});



$(".card .list-group").sortable({
  connectWith: $(".card .list-group"),
  scroll: false,
  tolerance: "pointer",
  helper: "clone",
  activate: function(event){
    //console.log("activate",this); 
  },
  deactivate: function(event){
    //console.log("deactivate",this); 
  },
  over: function(event){
    //console.log("over", event.target);
  },
  out: function(event){
    //console.log("out", event.target);
  },
  
  //array to store task data


  update: function(event){
    var tempArr = [];
    //loop over children in sortable list
    $(this).children().each(function(){
      //console.log("update",$(this));
      var text = $(this).find("p").text().trim();
      var date = $(this).find("span").text().trim();
      
      
      //console.log(text,date)

      //push to array
      tempArr.push({
        text: text,
        date: date
      });
      
      
      
     
    });
    var arrName = $(this).attr("id").replace("list-", "");
    tasks[arrName] = tempArr;
    saveTasks();
    //console.log(arrName);

    
  
  //console.log(tempArr); 
  }
});




// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
  // clear values
  $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
  // highlight textarea
  $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
  // get form values
  var taskText = $("#modalTaskDescription").val();
  var taskDate = $("#modalDueDate").val();

  if (taskText && taskDate) {
    createTask(taskText, taskDate, "toDo");

    // close modal
    $("#task-form-modal").modal("hide");

    // save in tasks array
    tasks.toDo.push({
      text: taskText,
      date: taskDate
    });

    saveTasks();
  }
});



$("#trash").droppable({
  accept: ".card .list-group-item",
  tolerance: "touch",
  drop: function(event, ui){
    //console.log("drop");
    ui.draggable.remove()
  },
  over: function(event, ui){
    //console.log("over");
  },
  out: function(event, ui){
    //console.log("out");
  },
})


// remove all tasks
$("#remove-tasks").on("click", function() {
  for (var key in tasks) {
    tasks[key].length = 0;
    $("#list-" + key).empty();
  }
  saveTasks();
});




$("#modalDueDate").datepicker({
  minDate: 1
});


var auditTask = function(taskEl){
  // get date from task
  var date = $(taskEl).find("span").text().trim();
  
  // put in a moment obj
  var time = moment(date, "L").set("hour", 17);
  

  // re-paint the card - remove old calsses form element
  $(taskEl).removeClass("list-group-item-warning list-group-item-danger");
  
  if (moment().isAfter(time)) {
    $(taskEl).addClass("list-group-item-danger");
  } else if (Math.abs(moment().diff(time, "days"))<=2){
    $(taskEl).addClass("list-group-item-warning");
  } 
  
  //ensure element is getting to the function
  //console.log(taskEl);
};

// ------------------------
// main -------------------
// ------------------------

// load tasks for the first time
loadTasks();