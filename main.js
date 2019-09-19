const STORAGE_KEY = "todos-vuejs" ;
const todoStorage = {
  fetch: function() {
   const todos = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    todos.forEach(function(todo, index) {
      todo.id = index
    });
    todoStorage.uid = todos.length;
    return todos
  },
  save: function(todos) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }
};

const app = new Vue({
  el: "#app",
  data: {
    todos: [],
    options: [
      { value: -1, label: "すべて"},
      { value: 0, label: "作業中"},
      { value: 1, label: "完了"}
    ],
    current: -1,
    newTodo: '',
    editedTodo: ''
  },
  methods: {
    addTodo: function () {
      const value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      this.todos.push({
        id: todoStorage.uid++,
        content: this.newTodo,
        state: 0
      });
      this.newTodo = ""
    },
    isButtonDisabled: function () {
      return !this.newTodo.trim().length
    },
    doChangeState: function (todo) {
      todo.state = todo.state ? 0 : 1
    },
    doRemove: function (todo) {
      const index = this.todos.indexOf(todo);
      this.todos.splice(index, 1)
    },
    editTodo: function (todo) {
      if (todo.state === 1) return;
      this.beforeEditCache = todo.content;
      this.editedTodo = todo
    },
    doneEdit: function (event, todo) {
      if (event.keyCode !== 13 && event.type !== 'blur') return;
      if (!this.editedTodo) return;
      this.editedTodo = null;
      todo.content = todo.content.trim();
      if (!todo.content) {
        this.doRemove(todo)
      }
    },
    cancelEdit: function (todo) {
      this.editedTodo = null;
      todo.content = this.beforeEditCache
    }
  },
  watch: {
    todos: {
      handler: function (todos) {
        todoStorage.save(todos)
      },
      deep: true
    }
  },
  created: function () {
    this.todos = todoStorage.fetch()
  },
  computed: {
    computedTodos: function () {
      return this.todos.filter(function (el) {
        return this.current < 0 ? true : this.current === el.state
      }, this)
    },
    labels: function () {
      return this.options.reduce(function (a, b) {
        return Object.assign(a, { [ b.value ]: b.label })
      }, {})
    }
  },
  directives: {
    'todo-focus': function (el, binding) {
      if (binding.value) {
        el.focus()
      }
    }
  }
});
