$(document).ready(function() {
    var app = new App();
    app.hideAllPages();
    app.showLogin();
});

Class('App', {
    has: {
        user: {
            is: 'rw'
        },
        login: {
            is: 'ro',
            init: function() {
                return new TaskList({
                    id: $('#login'),
                    title: $('#login #title'),
                    content: $('#login #content')
                })
            }
        },
        taskList: {
            is: 'ro',
            init: function() {
                return new TaskList({
                    id: $('#taskList'),
                    title: $('#taskList #title'),
                    content: $('#taskList #content')
                })
            }
        }
    },
    methods: {
        hideAllPages: function() {
            this.getLogin().getId().hide();
            this.getTaskList().getId().hide();
        },
        showLogin: function() {
            var app = this;
            var login = this.getLogin();
            login.getId().show();
            $('#loginButton').click(function() {
                var address = $('#address').val();
                var password = $('#password').val();

                app.setUser(new User({
                    address: address,
                    password: password
                }));
                app.hideAllPages();
                app.showTaskList();
            })
        },
        showTaskList: function() {
            var taskList = this.getTaskList();
            var user = this.getUser();
            taskList.getId().show();
            if (!user.loggedIn) {
                user.login(function(data) {
                    user.setLoggedIn(true);
                    taskList.showTitle(data.message);
                });
            }
            user.getTodos(function(data) {
                taskList.showTaskList(JSON.parse(data.content["result"]))
            });

        }
    }

});

Class("User", {
    has: {
        address: {
            is: 'ro',
        },
        password: {
            is: 'ro',
        },
        loggedIn: {
            is: 'rw',
            init: false,
        }
    },
    methods: {
        login: function(display) {
            $.post("http://hiveminder.com/=/action/Login.json", {
                address: this.getAddress(),
                password: this.getPassword()
            },
            display, 'json');
        },
        getTodos: function(display) {
            $.post("http://hiveminder.com/=/action/DownloadTasks.json", {
                format: "json"
            },
            display, 'json');
        }
    }
});

Class("Page", {
    has: {
        id: {
            is: 'ro',
            init: function() {
                return $('#main')
            }
        },
        title: {
            is: 'rw',
            init: function() {
                return $('#title')
            }
        },
        content: {
            is: 'ro',
            lazy: true,
            init: function() {
                return $('#content')
            }
        }
    },
    methods: {
        showTitle: function(title) {
            this.getTitle().html(title);
        },
        showContent: function(content) {
            this.getContent().html(content);
        }
    }
});

Class("TaskList", {
    isa: Page,
    methods: {
        showTaskList: function(list) {
            var content = "";
            for (idx in list) {
                var item = list[idx];
                var text = '<li>';
                text = text + item.summary;
                if (item.tags) text = text + ' [' + item.tags + ']';
                text = text + '</li>';
                content = content + text;
            }
            this.showContent(content);
        }
    }
})