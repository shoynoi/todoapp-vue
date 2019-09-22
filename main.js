const STORAGE_KEY = "todos-vuejs";
const todoStorage = {
  fetch: function() {
   const todos = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );
    if (todos) {
      todoStorage.uid = todos.reduce(function (a, b) {
        return a.id > b.id ? a.id : b.id
      }, 0)} else {
      todoStorage.uid = 0
    }
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
    editedContent: '',
    deadline: '',
    editedDeadline: '',
    sortOrder: 0,
    sortOptions: [
      { id: 1, value: 1, label: "標準"},
      { id: 2, value: 2, label: "期限"}
    ]
  },
  methods: {
    addTodo: function () {
      const value = this.newTodo && this.newTodo.trim();
      if (!value) {
        return;
      }
      this.todos.push({
        id: ++todoStorage.uid,
        content: this.newTodo,
        deadline: this.deadline,
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
      this.editedContent = todo
    },
    editDeadline: function(todo) {
      if (todo.state === 1) return;
      this.beforeEditCache = todo.deadline;
      this.editedDeadline = todo;
    },
    doneEditContent: function (event, todo) {
      if (event.keyCode !== 13 && event.type !== 'blur') return;
      if (!this.editedContent) return;
      this.editedContent = null;
      todo.content = todo.content.trim();
      if (!todo.content) {
        this.cancelEditContent(todo)
      }
    },
    doneEditDeadline: function(event, todo) {
      if (event.keyCode !== 13 && event.type !== 'blur') return;
      if (!this.editedDeadline) return;
      this.editedDeadline = null;
    },
    cancelEditContent: function (todo) {
      this.editedContent = null;
      todo.content = this.beforeEditCache
    },
    cancelEditDeadline: function (todo) {
      this.editedDeadline = null;
      todo.deadline = this.editedDeadline
    },
    today: function () {
      return moment().format('YYYY-MM-DD');
    },
    sortTodos: function () {
      if (this.sortOrder === 1) {
        return this.todos.sort((a, b) => a.id - b.id)
      } else if (this.sortOrder === 2) {
        return this.todos.sort(function (a, b) {
          if (a.deadline === '') return 1;
          if (b.deadline === '') return -1;
          if (a.deadline === b.deadline) return 0;
          return moment(a.deadline).diff(moment(b.deadline))
        })
      }
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
      }, this);
    },
    labels: function () {
      return this.options.reduce(function (a, b) {
        return Object.assign(a, { [ b.value ]: b.label })
      }, {})
    }
  },
  filters: {
    formatDeadline: function (val) {
      const date = moment(val);
      if (val === '') {
        return 'なし'
      } else if (date.year() === moment().year()) {
        return date.format('M月D日')
      } else {
        return date.format('YYYY年M月D日')
      }
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
