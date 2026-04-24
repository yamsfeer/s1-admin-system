import { p as request, _ as _export_sfc, v as onMounted, o as openBlock, c as createElementBlock, f as createBaseVNode, a as createVNode, w as withCtx, A as withDirectives, i as createBlock, E as ElMessage, r as resolveComponent, h as ref, B as resolveDirective, m as computed, e as createTextVNode, t as toDisplayString, n as ElMessageBox, g as reactive } from "./index-CEcSfnM8.js";
function getCustomers(params) {
  return request.get("/customers", { params });
}
function createCustomer(data) {
  return request.post("/customers", data);
}
function updateCustomer(id, data) {
  return request.put(`/customers/${id}`, data);
}
function deleteCustomer(id) {
  return request.delete(`/customers/${id}`);
}
const _hoisted_1 = { class: "customer-list-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "search-bar" };
const _sfc_main = {
  __name: "CustomerList",
  setup(__props) {
    const loading = ref(false);
    const submitting = ref(false);
    const dialogVisible = ref(false);
    const isEdit = ref(false);
    const currentId = ref(null);
    const customerList = ref([]);
    const searchKeyword = ref("");
    const formRef = ref();
    const form = reactive({
      name: "",
      phone: "",
      address: "",
      remark: ""
    });
    const formRules = {
      name: [
        { required: true, message: "请输入客户姓名", trigger: "blur" }
      ]
    };
    const filteredCustomerList = computed(() => {
      const keyword = searchKeyword.value.trim();
      if (!keyword) {
        return customerList.value;
      }
      const lowerKeyword = keyword.toLowerCase();
      return customerList.value.filter((item) => {
        const nameMatch = item.name && item.name.toLowerCase().includes(lowerKeyword);
        const phoneMatch = item.phone && item.phone.includes(keyword);
        const addressMatch = item.address && item.address.toLowerCase().includes(lowerKeyword);
        return nameMatch || phoneMatch || addressMatch;
      });
    });
    async function loadCustomers() {
      loading.value = true;
      try {
        const res = await getCustomers();
        customerList.value = res.data || [];
      } catch (error) {
        console.error("加载客户列表失败", error);
        ElMessage.error("加载客户列表失败");
      } finally {
        loading.value = false;
      }
    }
    function handleSearch() {
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
      form.name = row.name || "";
      form.phone = row.phone || "";
      form.address = row.address || "";
      form.remark = row.remark || "";
      dialogVisible.value = true;
    }
    function resetForm() {
      form.name = "";
      form.phone = "";
      form.address = "";
      form.remark = "";
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
          await updateCustomer(currentId.value, {
            name: form.name,
            phone: form.phone,
            address: form.address,
            remark: form.remark
          });
          ElMessage.success("修改成功");
        } else {
          await createCustomer({
            name: form.name,
            phone: form.phone,
            address: form.address,
            remark: form.remark
          });
          ElMessage.success("新增成功");
        }
        dialogVisible.value = false;
        loadCustomers();
      } catch (error) {
        console.error(isEdit.value ? "修改客户失败" : "新增客户失败", error);
        if ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) {
          ElMessage.error(error.response.data.message);
        }
      } finally {
        submitting.value = false;
      }
    }
    async function handleDelete(row) {
      var _a, _b;
      try {
        await ElMessageBox.confirm(
          `确定要删除客户「${row.name || ""}」吗？`,
          "删除确认",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        await deleteCustomer(row.id);
        ElMessage.success("删除成功");
        loadCustomers();
      } catch (error) {
        if (error === "cancel") {
          return;
        }
        console.error("删除客户失败", error);
        if ((_b = (_a = error.response) == null ? void 0 : _a.data) == null ? void 0 : _b.message) {
          ElMessage.error(error.response.data.message);
        } else {
          ElMessage.error("删除失败");
        }
      }
    }
    onMounted(() => {
      loadCustomers();
    });
    return (_ctx, _cache) => {
      const _component_Plus = resolveComponent("Plus");
      const _component_el_icon = resolveComponent("el-icon");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_input = resolveComponent("el-input");
      const _component_el_table_column = resolveComponent("el-table-column");
      const _component_el_table = resolveComponent("el-table");
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_form = resolveComponent("el-form");
      const _component_el_dialog = resolveComponent("el-dialog");
      const _directive_loading = resolveDirective("loading");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[8] || (_cache[8] = createBaseVNode("h2", null, "客户管理", -1)),
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
              _cache[7] || (_cache[7] = createTextVNode(" 新增客户 ", -1))
            ]),
            _: 1
          })
        ]),
        createBaseVNode("div", _hoisted_3, [
          createVNode(_component_el_input, {
            modelValue: searchKeyword.value,
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => searchKeyword.value = $event),
            placeholder: "搜索客户姓名、电话或地址",
            clearable: "",
            "prefix-icon": "Search",
            style: { "width": "320px" },
            onInput: handleSearch
          }, null, 8, ["modelValue"])
        ]),
        withDirectives((openBlock(), createBlock(_component_el_table, {
          data: filteredCustomerList.value,
          stripe: "",
          border: "",
          class: "customer-table"
        }, {
          default: withCtx(() => [
            createVNode(_component_el_table_column, {
              prop: "name",
              label: "姓名",
              "min-width": "120"
            }, {
              default: withCtx(({ row }) => [
                createBaseVNode("span", null, toDisplayString(row.name || "-"), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "phone",
              label: "电话",
              "min-width": "140"
            }, {
              default: withCtx(({ row }) => [
                createBaseVNode("span", null, toDisplayString(row.phone || "-"), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "address",
              label: "地址",
              "min-width": "200",
              "show-overflow-tooltip": ""
            }, {
              default: withCtx(({ row }) => [
                createBaseVNode("span", null, toDisplayString(row.address || "-"), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "remark",
              label: "备注",
              "min-width": "160",
              "show-overflow-tooltip": ""
            }, {
              default: withCtx(({ row }) => [
                createBaseVNode("span", null, toDisplayString(row.remark || "-"), 1)
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
                  default: withCtx(() => [..._cache[9] || (_cache[9] = [
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
                  default: withCtx(() => [..._cache[10] || (_cache[10] = [
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
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => dialogVisible.value = $event),
          title: isEdit.value ? "编辑客户" : "新增客户",
          width: "500px",
          "destroy-on-close": "",
          onClose: resetForm
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[5] || (_cache[5] = ($event) => dialogVisible.value = false)
            }, {
              default: withCtx(() => [..._cache[11] || (_cache[11] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              loading: submitting.value,
              onClick: handleSubmit
            }, {
              default: withCtx(() => [..._cache[12] || (_cache[12] = [
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
                createVNode(_component_el_form_item, {
                  label: "姓名",
                  prop: "name"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.name,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.name = $event),
                      placeholder: "请输入客户姓名",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "电话",
                  prop: "phone"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.phone,
                      "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.phone = $event),
                      placeholder: "请输入客户电话",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "地址",
                  prop: "address"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.address,
                      "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.address = $event),
                      placeholder: "请输入常用地址",
                      clearable: ""
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_form_item, {
                  label: "备注",
                  prop: "remark"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input, {
                      modelValue: form.remark,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.remark = $event),
                      type: "textarea",
                      rows: 3,
                      placeholder: "请输入备注信息"
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
const CustomerList = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-9d59c4b1"]]);
export {
  CustomerList as default
};
