export default [
  {
    path: '/',
    component: '../layouts/BlankLayout',
    routes: [
      {
        path: '/user',
        component: '../layouts/UserLayout',
        routes: [
          {
            name: 'login',
            path: '/user/login',
            component: './login',
          },
        ],
      },

      {
        path: '/',
        component: '../layouts/BasicLayout',
        // authority: ['system:user:info'],
        routes: [

          // {
          //   name: 'login',
          //   path: '/user/login',
          //   component: './login',
          // },

          // {
          //   path: '/',
          //   redirect: '/home',
          //   // authority: ['system:user:info'],
          // },
          {
            path: '/',
            redirect: '/user/login',
            // authority: ['system:user:info'],
          },
          // home
          {
            path: '/data',
            name: '数据中心',
            icon: 'home',
            component: './data',
          },

          {
            path: '/account/themCenter',
            name: '主题中心',
            icon: 'home',
            component: './account/them/center',
          },
          // {
          //   path: '/task',
          //   name: '任务中心',
          //   icon: 'user',
          //   component: './task',
          // },
          // account
          {
            path: '/account',
            name: 'account',
            icon: 'user',
            routes: [
              {
                path: '/account/topic',
                name: '话题列表',
                icon: 'user',
                component: './account/topic',
              },
              {
                path: '/account/topic/detail',
                name: '话题列表',
                icon: 'user',
                component: './account/topic/detail',
                hideInMenu: true,
              },
              {
                path: '/account/them',
                name: '主题列表',
                icon: 'home',
                component: './account/them',
              },
              // {
              //   path: '/account/task',
              //   name: '任务列表',
              //   icon: 'user',
              //   component: './account/task',
              // },
              {
                path: '/account/article',
                name: '文章列表',
                icon: 'user',
                component: './account/article',
              },
              // {
              //   path: '/account/short',
              //   name: '短文列表',
              //   icon: 'user',
              //   component: './account/short',
              // },
              // {
              //   path: '/account/center',
              //   name: 'center',
              //   icon: 'user',
              //   component: './account/center',
              // },
              {
                path: '/account/settings',
                name: '设置中心',
                icon: 'user',
                component: './account/settings',
              },
            ],
          },
          // system
          // {
          //   path: '/system',
          //   name: 'system',
          //   icon: 'setting',
          //   routes: [
          //     {
          //       path: '/system/departments',
          //       name: 'department',
          //       component: './system/department',
          //       // authority: ['system:department:tree'],
          //     },
          //     {
          //       path: '/system/users',
          //       name: 'user',
          //       component: './system/user',
          //       //    authority: ['system:user:list'],
          //     },
          //     {
          //       path: '/system/roles',
          //       name: 'role',
          //       component: './system/role',
          //       //  authority: ['system:role:tree'],
          //     },
          //     {
          //       path: '/system/menus',
          //       name: 'menu',
          //       component: './system/menu',
          //       //  authority: ['system:menu:tree'],
          //     },
          //     {
          //       path: '/system/apis',
          //       name: 'api',
          //       component: './system/api',
          //       //   authority: ['system:api:children'],
          //     },
          //     {
          //       path: '/system/regions',
          //       name: 'region',
          //       component: './system/region',
          //       //  authority: ['system:region:tree'],
          //     },
          //     {
          //       path: '/system/dictionaries',
          //       name: 'dictionary',
          //       component: './system/dictionary',
          //       // authority: ['system:dictionary:list'],
          //     },
          //     {
          //       path: '/system/dictionaries/item',
          //       name: 'dictionaryItem',
          //       component: './system/dictionary/dictionaryItem',
          //       hideInMenu: true,
          //       hideInBreadcrumb: false,
          //     },
          //     {
          //       component: './404',
          //     },
          //   ],
          // },
          // exception
          {
            path: '/exception',
            name: 'exception',
            icon: 'warning',
            hideInMenu: true,
            routes: [
              {
                path: '/exception/403',
                name: 'not-permission',
                component: './exception/403',
              },
              {
                path: '/exception/404',
                name: 'not-find',
                component: './exception/404',
              },
              {
                path: '/exception/500',
                name: 'server-error',
                component: './exception/500',
              },
              {
                component: './404',
              },
            ],
          },
          {
            component: './404',
          },
        ],
      },
    ],
  },
  {
    component: './404',
  },
];
