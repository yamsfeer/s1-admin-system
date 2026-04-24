import { _ as _export_sfc, v as onMounted, o as openBlock, c as createElementBlock, f as createBaseVNode, a as createVNode, w as withCtx, E as ElMessage, r as resolveComponent, h as ref, b as useRouter, F as Fragment, D as renderList, i as createBlock, e as createTextVNode, g as reactive } from "./index-CEcSfnM8.js";
import { c as createOrder } from "./orders-CUH8JNX4.js";
import { g as getTechnicians } from "./technicians-Dj-TSsue.js";
const _hoisted_1 = { class: "order-create-page" };
const _sfc_main = {
  __name: "OrderCreate",
  setup(__props) {
    const router = useRouter();
    const formRef = ref(null);
    const submitting = ref(false);
    const technicians = ref([]);
    const form = reactive({
      customer_name: "",
      customer_phone: "",
      address: "",
      description: "",
      tech_id: null
    });
    const rules = {
      customer_name: [
        { required: true, message: "此项为必填", trigger: "blur" }
      ],
      address: [
        { required: true, message: "此项为必填", trigger: "blur" }
      ],
      description: [
        { required: true, message: "此项为必填", trigger: "blur" }
      ]
    };
    function handleTechChange(val) {
      if (val === "" || val === void 0) {
        form.tech_id = null;
      }
    }
    async function loadTechnicians() {
      try {
        const res = await getTechnicians();
        technicians.value = res.data || [];
      } catch (error) {
        console.error("加载技师列表失败", error);
        ElMessage.error("加载技师列表失败");
      }
    }
    async function handleSubmit() {
      try {
        await formRef.value.validate();
      } catch {
        return;
      }
      submitting.value = true;
      try {
        const payload = {
          customer_name: form.customer_name.trim(),
          customer_phone: form.customer_phone.trim(),
          address: form.address.trim(),
          description: form.description.trim()
        };
        if (form.tech_id !== null && form.tech_id !== void 0 && form.tech_id !== "") {
          payload.tech_id = form.tech_id;
        }
        await createOrder(payload);
        ElMessage.success("创建成功");
        router.push("/orders");
      } catch (error) {
        console.error("创建工单失败", error);
      } finally {
        submitting.value = false;
      }
    }
    function handleCancel() {
      router.back();
    }
    onMounted(() => {
      loadTechnicians();
    });
    return (_ctx, _cache) => {
      const _component_el_input = resolveComponent("el-input");
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_option = resolveComponent("el-option");
      const _component_el_select = resolveComponent("el-select");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_form = resolveComponent("el-form");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        _cache[7] || (_cache[7] = createBaseVNode("div", { class: "page-header" }, [
          createBaseVNode("h2", null, "新建工单")
        ], -1)),
        createVNode(_component_el_form, {
          ref_key: "formRef",
          ref: formRef,
          model: form,
          rules,
          "label-width": "100px",
          class: "order-form"
        }, {
          default: withCtx(() => [
            createVNode(_component_el_form_item, {
              label: "客户姓名",
              prop: "customer_name"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  modelValue: form.customer_name,
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => form.customer_name = $event),
                  placeholder: "请输入客户姓名",
                  maxlength: "50",
                  "show-word-limit": ""
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "客户电话",
              prop: "customer_phone"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  modelValue: form.customer_phone,
                  "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => form.customer_phone = $event),
                  placeholder: "请输入客户电话",
                  maxlength: "20"
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "维修地址",
              prop: "address"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  modelValue: form.address,
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => form.address = $event),
                  type: "textarea",
                  rows: 2,
                  placeholder: "请输入维修地址",
                  maxlength: "200",
                  "show-word-limit": ""
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "问题描述",
              prop: "description"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_input, {
                  modelValue: form.description,
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => form.description = $event),
                  type: "textarea",
                  rows: 4,
                  placeholder: "请详细描述故障情况",
                  maxlength: "500",
                  "show-word-limit": ""
                }, null, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, {
              label: "指派技师",
              prop: "tech_id"
            }, {
              default: withCtx(() => [
                createVNode(_component_el_select, {
                  modelValue: form.tech_id,
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => form.tech_id = $event),
                  placeholder: "请选择指派技师",
                  style: { "width": "100%" },
                  onChange: handleTechChange
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_option, {
                      label: "暂不指派",
                      value: null
                    }),
                    (openBlock(true), createElementBlock(Fragment, null, renderList(technicians.value, (tech) => {
                      return openBlock(), createBlock(_component_el_option, {
                        key: tech.id,
                        label: `${tech.real_name} (在单${tech.active_orders}个)`,
                        value: tech.id
                      }, null, 8, ["label", "value"]);
                    }), 128))
                  ]),
                  _: 1
                }, 8, ["modelValue"])
              ]),
              _: 1
            }),
            createVNode(_component_el_form_item, null, {
              default: withCtx(() => [
                createVNode(_component_el_button, {
                  type: "primary",
                  loading: submitting.value,
                  onClick: handleSubmit
                }, {
                  default: withCtx(() => [..._cache[5] || (_cache[5] = [
                    createTextVNode(" 提交 ", -1)
                  ])]),
                  _: 1
                }, 8, ["loading"]),
                createVNode(_component_el_button, { onClick: handleCancel }, {
                  default: withCtx(() => [..._cache[6] || (_cache[6] = [
                    createTextVNode("取消", -1)
                  ])]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["model"])
      ]);
    };
  }
};
const OrderCreate = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-0a8b7bbd"]]);
export {
  OrderCreate as default
};
