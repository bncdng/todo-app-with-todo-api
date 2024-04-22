// GET ELEMENTS FROM HTML
const todoList = document.getElementById("todoList");
const addTodoForm = document.getElementById("addTodoForm");
const radio = Array.from(document.querySelector(".input-filter"));
const menu = document.querySelector(".menu");
const removeDoneTodos = document.getElementById("removeDoneTodos");
const inputElement = document.getElementById("newTodo");
const errorEl = document.getElementById("error");

// STATE
let state = {
  todos: [],
  filter: "all",
  error: "",
};

// RENDER FUNCTION
function render() {
  // Clear Todo List
  todoList.innerHTML = "";
  errorEl.innerHTML = "";

  if (state.error) {
    errorEl.textContent = state.error;
  }

  // Create HTML list item and iterate over each to check filter
  generateFilter().forEach((todo) => {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.name = "done";
    input.id = "checkbox";
    input.checked = todo.done;

    // Event Listener for state update in local storage
    input.addEventListener("change", () => {
      // State update when checkbox is changed
      todo.done = input.checked;
      render();
      fetch(`http://localhost:4730/todos/${todo.id}`, {
        method: "PATCH",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ done: input.checked }),
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          console.log("data", data);
          refresh();
        });
    });

    const span = document.createElement("span");
    span.textContent = todo.description;

    const label = document.createElement("label");
    label.append(input, span);
    label.for = "check";

    const form = document.createElement("form");
    form.append(label);

    const li = document.createElement("li");
    li.append(form);

    // Add a class to the list item based on the todo's done status
    if (todo.done) {
      li.classList.add("strike");
    }

    todoList.append(li);
  });
}

// REFRESH FUNCTION - GET REQUEST
function refresh() {
  fetch("http://localhost:4730/todos")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log("data", data);
      state.todos = data;
      render();
    })
    .catch(() => {
      state.error = "Sorry, we couldn't reach the backend";
      render();
    });
}

// FILTER FUNCTION
function generateFilter() {
  if (state.filter == "all") {
    return state.todos;
  } else if (state.filter == "open") {
    return state.todos.filter((item) => !item.done);
  } else if (state.filter == "done") {
    return state.todos.filter((item) => item.done);
  }
}

// EVENT LISTENER FOR FILTER
menu.addEventListener("change", (e) => {
  if (e.target.type === "radio") {
    radio.forEach((radioBtn) => {
      radioBtn.checked = false;
    });
    state.filter = e.target.id;
    render();
  }
});

// EVENT LISTENER FOR REMOVE DONE TODOS BUTTON - DELETE METHOD
removeDoneTodos.addEventListener("click", (event) => {
  event.preventDefault();
  const TodosToBeRemoved = state.todos.filter((todo) => todo.done);
  console.log(TodosToBeRemoved);
  TodosToBeRemoved.forEach((todo) => {
    fetch(`http://localhost:4730/todos/${todo.id}`, {
      method: "DELETE",
    })
      .then((response) => {
        return response.json();
      })
      .then(() => {
        refresh();
      });
  });
  render();
});

// EVENT LISTENER FOR FORM SUBMISSION - POST METHOD
addTodoForm.addEventListener("submit", (event) => {
  // Prevent from refreshing form
  event.preventDefault();

  // Validate and trim input value
  const inputValue = inputElement.value.trim();

  const newTodo = {
    description: inputValue,
    done: false,
  };

  // Input field can't be empty
  if (inputValue == "") {
    alert("Please insert Description");
    return;
  }

  // Remove Duplicate
  if (
    state.todos.some((todo) => {
      return todo.description.toLowerCase() == inputValue.toLowerCase();
    })
  ) {
    alert("Todo already exists");
    return;
  }

  // POST method
  fetch("http://localhost:4730/todos", {
    method: "POST",
    headers: { "Content-type": "application/json" },
    body: JSON.stringify(newTodo),
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      console.log("data", data);
      refresh();

      // Reset Form
      addTodoForm.reset();
    });

  // // Update State with new Todo
  // const id = Date.now();

  // Render
  render();
});

// INITIAL RENDER
render();

// INITIAL LOAD
refresh();
