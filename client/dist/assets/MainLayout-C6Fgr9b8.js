import { _ as _export_sfc, u as useUserStore, o as openBlock, i as createBlock, w as withCtx, r as resolveComponent, j as useRoute, b as useRouter, a as createVNode, f as createBaseVNode, k as createCommentVNode, t as toDisplayString, e as createTextVNode, m as computed, n as ElMessageBox, E as ElMessage } from "./index-CEcSfnM8.js";
const _hoisted_1 = { class: "logo" };
const _hoisted_2 = { class: "header-right" };
const _hoisted_3 = { class: "username" };
const _sfc_main = {
  __name: "MainLayout",
  setup(__props) {
    const route = useRoute();
    const router = useRouter();
    const userStore = useUserStore();
    const activeMenu = computed(() => route.path);
    const user = computed(() => userStore.user);
    const isAdmin = computed(() => userStore.isAdmin);
    async function handleLogout() {
      try {
        await ElMessageBox.confirm("确定要退出登录吗？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });
        userStore.clearUser();
        ElMessage.success("已退出登录");
        router.push("/login");
      } catch {
      }
    }
    return (_ctx, _cache) => {
      const _component_Tools = resolveComponent("Tools");
      const _component_el_icon = resolveComponent("el-icon");
      const _component_Odometer = resolveComponent("Odometer");
      const _component_el_menu_item = resolveComponent("el-menu-item");
      const _component_Document = resolveComponent("Document");
      const _component_User = resolveComponent("User");
      const _component_UserFilled = resolveComponent("UserFilled");
      const _component_el_menu = resolveComponent("el-menu");
      const _component_el_aside = resolveComponent("el-aside");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_header = resolveComponent("el-header");
      const _component_router_view = resolveComponent("router-view");
      const _component_el_main = resolveComponent("el-main");
      const _component_el_container = resolveComponent("el-container");
      return openBlock(), createBlock(_component_el_container, { class: "main-layout" }, {
        default: withCtx(() => [
          createVNode(_component_el_aside, {
            width: "200px",
            class: "sidebar"
          }, {
            default: withCtx(() => [
              createBaseVNode("div", _hoisted_1, [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(_component_Tools)
                  ]),
                  _: 1
                }),
                _cache[0] || (_cache[0] = createBaseVNode("span", null, "维修派单管家", -1))
              ]),
              createVNode(_component_el_menu, {
                "default-active": activeMenu.value,
                router: "",
                class: "sidebar-menu",
                "background-color": "#304156",
                "text-color": "#bfcbd9",
                "active-text-color": "#409EFF"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_menu_item, { index: "/dashboard" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(_component_Odometer)
                        ]),
                        _: 1
                      }),
                      _cache[1] || (_cache[1] = createBaseVNode("span", null, "数据看板", -1))
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_menu_item, { index: "/orders" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(_component_Document)
                        ]),
                        _: 1
                      }),
                      _cache[2] || (_cache[2] = createBaseVNode("span", null, "工单管理", -1))
                    ]),
                    _: 1
                  }),
                  isAdmin.value ? (openBlock(), createBlock(_component_el_menu_item, {
                    key: 0,
                    index: "/technicians"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(_component_User)
                        ]),
                        _: 1
                      }),
                      _cache[3] || (_cache[3] = createBaseVNode("span", null, "技师管理", -1))
                    ]),
                    _: 1
                  })) : createCommentVNode("", true),
                  isAdmin.value ? (openBlock(), createBlock(_component_el_menu_item, {
                    key: 1,
                    index: "/customers"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_icon, null, {
                        default: withCtx(() => [
                          createVNode(_component_UserFilled)
                        ]),
                        _: 1
                      }),
                      _cache[4] || (_cache[4] = createBaseVNode("span", null, "客户管理", -1))
                    ]),
                    _: 1
                  })) : createCommentVNode("", true)
                ]),
                _: 1
              }, 8, ["default-active"])
            ]),
            _: 1
          }),
          createVNode(_component_el_container, null, {
            default: withCtx(() => [
              createVNode(_component_el_header, { class: "header" }, {
                default: withCtx(() => {
                  var _a, _b;
                  return [
                    createBaseVNode("div", _hoisted_2, [
                      createBaseVNode("span", _hoisted_3, toDisplayString(((_a = user.value) == null ? void 0 : _a.real_name) || ((_b = user.value) == null ? void 0 : _b.username)), 1),
                      createVNode(_component_el_button, {
                        type: "danger",
                        size: "small",
                        plain: "",
                        onClick: handleLogout
                      }, {
                        default: withCtx(() => [..._cache[5] || (_cache[5] = [
                          createTextVNode(" 退出登录 ", -1)
                        ])]),
                        _: 1
                      })
                    ])
                  ];
                }),
                _: 1
              }),
              createVNode(_component_el_main, { class: "main-content" }, {
                default: withCtx(() => [
                  createVNode(_component_router_view)
                ]),
                _: 1
              })
            ]),
            _: 1
          })
        ]),
        _: 1
      });
    };
  }
};
const MainLayout = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-f0a83364"]]);
export {
  MainLayout as default
};
