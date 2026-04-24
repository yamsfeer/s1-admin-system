import { _ as _export_sfc, v as onMounted, o as openBlock, c as createElementBlock, f as createBaseVNode, a as createVNode, w as withCtx, A as withDirectives, i as createBlock, E as ElMessage, r as resolveComponent, B as resolveDirective, h as ref, e as createTextVNode, t as toDisplayString, k as createCommentVNode, n as ElMessageBox, g as reactive } from "./index-CEcSfnM8.js";
import { g as getTechnicians, d as deleteTechnician, u as updateTechnician, c as createTechnician } from "./technicians-Dj-TSsue.js";
const _hoisted_1 = { class: "technician-list-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { key: 1 };
const _sfc_main = {
  __name: "TechnicianList",
  setup(__props) {
    const loading = ref(false);
    const submitting = ref(false);
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const currentId = ref(null);
    const technicianList = ref([]);
    const formRef = ref();
    const form = reactive({
      username: "",
      password: "",
      real_name: "",
      phone: ""
    });
    const formRules = {
      username: [
        { required: true, message: "请输入用户名", trigger: "blur" },
        { min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur" }
      ],
      password: [
        { required: true, message: "请输入密码", trigger: "blur" },
        { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
      ],
      real_name: [
        { required: true, message: "请输入姓名", trigger: "blur" }
      ],
      phone: [
        { required: true, message: "请输入手机号", trigger: "blur" },
        { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
      ]
    };
    async function loadTechnicians() {
      loading.value = true;
      try {
        const res = await getTechnicians();
        technicianList.value = res.data || [];
      } catch (error) {
        console.error("加载技师列表失败", error);
        ElMessage.error("加载技师列表失败");
      } finally {
        loading.value = false;
      }
    }
    function handleAdd() {
      isEdit.value = false;
      currentId.value = null;
      resetForm();
      dialogVisible.value = true;
    }
    function handleEdit(row) {
      isEdit.value = true;
      currentId.value = row.id;
      form.username = "";
      form.password = "";
      form.real_name = row.real_name || "";
      form.phone = row.phone || "";
      dialogVisible.value = true;
    }
    function resetForm() {
      form.username = "";
      form.password = "";
      form.real_name = "";
      form.phone = "";
      if (formRef.value) {
        formRef.value.resetFields();
      }
    }
    async function handleSubmit() {
      var _a, _b;
      const valid = await formRef.value.validate().catch(() => false);
      if (!valid) return;
      submitting.value = true;
      try {
        if (isEdit.value) {
          await updateTechnician(currentId.value, {
            real_name: form.real_name,
            phone: form.phone
          });
          ElMessage.success("修改成功");
        } else {
          await createTechnician({
            username: form.username,
            password: form.password,
            real_name: form.real_name,
            phone: form.phone
          });
          ElMessage.success("新增成功");
        }
        dialogVisible.value = false;
        loadTechnicians();
      } catch (error) {
        console.error(isEdit.value ? "修改技师失败" : "新增技师失败", error);
        if ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) {
          ElMessage.error(error.response.data.message);
        }
      } finally {
        submitting.value = false;
      }
    }
    async function handleDelete(row) {
      var _a, _b, _c, _d, _e;
      try {
        await ElMessageBox.confirm(
          `确定要删除技师「${row.real_name || row.username}」吗？`,
          "删除确认",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        await deleteTechnician(row.id);
        ElMessage.success("删除成功");
        loadTechnicians();
      } catch (error) {
        if (error === "cancel") {
          return;
        }
        console.error("删除技师失败", error);
        if (((_a = error.response) == null ? void 0 : _a.status) === 400) {
          const msg = ((_c = (_b = error.response) == null ? void 0 : _b.data) == null ? void 0 : _c.message) || "该技师有进行中的工单，无法删除";
          ElMessage.error(msg);
        } else if ((_e = (_d = error.response) == null ? void 0 : _d.data) == null ? void 0 : _e.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error("删除失败");
        }
      }
    }
    onMounted(() => {
      loadTechnicians();
    });
    return (_ctx, _cache) => {
      const _component_Plus = resolveComponent("Plus");
      const _component_el_icon = resolveComponent("el-icon");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_table_column = resolveComponent("el-table-column");
      const _component_el_tag = resolveComponent("el-tag");
      const _component_el_table = resolveComponent("el-table");
      const _component_el_input = resolveComponent("el-input");
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_form = resolveComponent("el-form");
      const _component_el_dialog = resolveComponent("el-dialog");
      const _directive_loading = resolveDirective("loading");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[7] || (_cache[7] = createBaseVNode("h2", null, "技师管理", -1)),
          createVNode(_component_el_button, {
            type: "primary",
            onClick: handleAdd
          }, {
            default: withCtx(() => [
              createVNode(_component_el_icon, null, {
                default: withCtx(() => [
                  createVNode(_component_Plus)
                ]),
                _: 1
              }),
              _cache[6] || (_cache[6] = createTextVNode(" 新增技师 ", -1))
            ]),
            _: 1
          })
        ]),
        withDirectives((openBlock(), createBlock(_component_el_table, {
          data: technicianList.value,
          stripe: "",
          border: "",
          class: "technician-table"
        }, {
          default: withCtx(() => [
            createVNode(_component_el_table_column, {
              prop: "real_name",
              label: "姓名",
              "min-width": "120"
            }, {
              default: withCtx(({ row }) => [
                createBaseVNode("span", null, toDisplayString(row.real_name || "-"), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "phone",
              label: "手机",
              "min-width": "140"
            }, {
              default: withCtx(({ row }) => [
                createBaseVNode("span", null, toDisplayString(row.phone || "-"), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "active_orders",
              label: "在单数",
              width: "100",
              align: "center"
            }, {
              default: withCtx(({ row }) => [
                row.active_orders > 0 ? (openBlock(), createBlock(_component_el_tag, {
                  key: 0,
                  type: "warning"
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(row.active_orders), 1)
                  ]),
                  _: 2
                }, 1024)) : (openBlock(), createElementBlock("span", _hoisted_3, "0"))
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              label: "操作",
              width: "160",
              align: "center",
              fixed: "right"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_component_el_button, {
                  type: "primary",
                  size: "small",
                  text: "",
                  onClick: ($event) => handleEdit(row)
                }, {
                  default: withCtx(() => [..._cache[8] || (_cache[8] = [
                    createTextVNode(" 编辑 ", -1)
                  ])]),
                  _: 1
                }, 8, ["onClick"]),
                createVNode(_component_el_button, {
                  type: "danger",
                  size: "small",
                  text: "",
                  onClick: ($event) => handleDelete(row)
                }, {
                  default: withCtx(() => [..._cache[9] || (_cache[9] = [
                    createTextVNode(" 删除 ", -1)
                  ])]),
                  _: 1
                }, 8, ["onClick"])
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["data"])), [
          [_directive_loading, loading.value]
        ]),
        createVNode(_component_el_dialog, {
          modelValue: dialogVisible.value,
          "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => dialogVisible.value = $event),
          title: isEdit.value ? "编辑技师" : "新增技师",
          width: "500px",
          "destroy-on-close": "",
          onClose: resetForm
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[4] || (_cache[4] = ($event) => dialogVisible.value = false)
            }, {
              default: withCtx(() => [..._cache[10] || (_cache[10] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              loading: submitting.value,
              onClick: handleSubmit
            }, {
              default: withCtx(() => [..._cache[11] || (_cache[11] = [
                createTextVNode(" 确定 ", -1)
              ])]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_form, {
              ref_key: "formRef",
              ref: formRef,
              model: form,
              rules: formRules,
              "label-width": "80px"
            }, {
              default: withCtx(() => [
                !isEdit.value ? (openBlock(), createBlock(_component_el_form_item, {
                  key: 0,
                  label: "用户名",
                  prop: "username"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.username,
                      "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.username = $event),
                      placeholder: "请输入用户名",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                !isEdit.value ? (openBlock(), createBlock(_component_el_form_item, {
                  key: 1,
                  label: "密码",
                  prop: "password"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.password,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.password = $event),
                      type: "password",
                      placeholder: "请输入密码",
                      "show-password": "",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                })) : createCommentVNode("", true),
                createVNode(_component_el_form_item, {
                  label: "姓名",
                  prop: "real_name"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.real_name,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.real_name = $event),
                      placeholder: "请输入姓名",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "手机",
                  prop: "phone"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.phone,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.phone = $event),
                      placeholder: "请输入手机号",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }, 8, ["model"])
          ]),
          _: 1
        }, 8, ["modelValue", "title"])
      ]);
    };
  }
};
const TechnicianList = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-d07802b7"]]);
export {
  TechnicianList as default
};
