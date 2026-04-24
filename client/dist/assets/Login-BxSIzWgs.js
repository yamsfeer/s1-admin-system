import { _ as _export_sfc, u as useUserStore, o as openBlock, c as createElementBlock, a as createVNode, w as withCtx, r as resolveComponent, b as useRouter, d as withKeys, e as createTextVNode, f as createBaseVNode, l as login, E as ElMessage, g as reactive, h as ref } from "./index-CEcSfnM8.js";
const _hoisted_1 = { class: "login-page" };
const _hoisted_2 = { class: "login-header" };
const _sfc_main = {
  __name: "Login",
  setup(__props) {
    const router = useRouter();
    const userStore = useUserStore();
    const formRef = ref();
    const loading = ref(false);
    const form = reactive({
      username: "",
      password: ""
    });
    const rules = {
      username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
      password: [{ required: true, message: "请输入密码", trigger: "blur" }]
    };
    async function handleLogin() {
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;
      loading.value = true;
      try {
        const res = await login({
          username: form.username,
          password: form.password
        });
        const { token, user } = res.data;
        userStore.setToken(token);
        userStore.setUser(user);
        ElMessage.success("登录成功");
        router.push("/dashboard");
      } catch (error) {
        console.error("登录失败", error);
      } finally {
        loading.value = false;
      }
    }
    return (_ctx, _cache) => {
      const _component_Tools = resolveComponent("Tools");
      const _component_el_icon = resolveComponent("el-icon");
      const _component_el_input = resolveComponent("el-input");
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_form = resolveComponent("el-form");
      const _component_el_card = resolveComponent("el-card");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createVNode(_component_el_card, { class: "login-card" }, {
          header: withCtx(() => [
            createBaseVNode("div", _hoisted_2, [
              createVNode(_component_el_icon, { size: "32" }, {
                default: withCtx(() => [
                  createVNode(_component_Tools)
                ]),
                _: 1
              }),
              _cache[2] || (_cache[2] = createBaseVNode("h2", null, "维修派单管家", -1))
            ])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_form, {
              ref_key: "formRef",
              ref: formRef,
              model: form,
              rules,
              "label-position": "top",
              onKeyup: withKeys(handleLogin, ["enter"])
            }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, {
                  label: "用户名",
                  prop: "username"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.username,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.username = $event),
                      placeholder: "请输入用户名",
                      "prefix-icon": "User",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "密码",
                  prop: "password"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.password,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.password = $event),
                      type: "password",
                      placeholder: "请输入密码",
                      "prefix-icon": "Lock",
                      "show-password": "",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, null, {
                  default: withCtx(() => [
                    createVNode(_component_el_button, {
                      type: "primary",
                      size: "large",
                      style: { "width": "100%" },
                      loading: loading.value,
                      onClick: handleLogin
                    }, {
                      default: withCtx(() => [..._cache[3] || (_cache[3] = [
                        createTextVNode(" 登录 ", -1)
                      ])]),
                      _: 1
                    }, 8, ["loading"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"]),
            _cache[4] || (_cache[4] = createBaseVNode("div", { class: "login-tips" }, [
              createBaseVNode("p", null, "默认管理员：admin / 123456"),
              createBaseVNode("p", null, "默认技师：zhangsan / 123456")
            ], -1))
          ]),
          _: 1
        })
      ]);
    };
  }
};
const Login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-b74c25da"]]);
export {
  Login as default
};
