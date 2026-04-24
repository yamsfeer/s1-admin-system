import { _ as _export_sfc, z as watch, v as onMounted, A as withDirectives, o as openBlock, c as createElementBlock, f as createBaseVNode, a as createVNode, w as withCtx, i as createBlock, k as createCommentVNode, B as resolveDirective, h as ref, r as resolveComponent, j as useRoute, b as useRouter, e as createTextVNode, t as toDisplayString, C as normalizeClass, d as withKeys, F as Fragment, D as renderList, E as ElMessage, n as ElMessageBox } from "./index-CEcSfnM8.js";
import { a as getOrderDetail, b as addRemark, u as updateOrderStatus } from "./orders-CUH8JNX4.js";
import { g as getTechnicians } from "./technicians-Dj-TSsue.js";
import { _ as _sfc_main$1 } from "./StatusTag-Gw5iEzJk.js";
const _hoisted_1 = { class: "order-detail-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "header-left" };
const _hoisted_4 = {
  key: 0,
  class: "header-actions"
};
const _hoisted_5 = { class: "card-header" };
const _hoisted_6 = {
  key: 0,
  class: "fee-text"
};
const _hoisted_7 = {
  key: 1,
  class: "text-muted"
};
const _hoisted_8 = { class: "add-remark" };
const _hoisted_9 = {
  key: 0,
  class: "remark-list"
};
const _hoisted_10 = { class: "remark-header" };
const _hoisted_11 = { class: "remark-author" };
const _hoisted_12 = { class: "remark-time" };
const _hoisted_13 = { class: "remark-content" };
const _sfc_main = {
  __name: "OrderDetail",
  setup(__props) {
    const router = useRouter();
    const route = useRoute();
    const order = ref(null);
    const loading = ref(false);
    const technicians = ref([]);
    const remarkContent = ref("");
    const addingRemark = ref(false);
    const assignDialogVisible = ref(false);
    const assignTechId = ref(null);
    const completeDialogVisible = ref(false);
    const completeFee = ref(0);
    const settleDialogVisible = ref(false);
    const settleFee = ref(0);
    const submitting = ref(false);
    async function loadOrder() {
      loading.value = true;
      try {
        const id = route.params.id;
        if (!id) {
          order.value = null;
          return;
        }
        const res = await getOrderDetail(id);
        order.value = res.data;
      } catch (error) {
        console.error("加载工单详情失败", error);
        order.value = null;
      } finally {
        loading.value = false;
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
    function goBack() {
      router.push("/orders");
    }
    function showAssignDialog() {
      assignTechId.value = null;
      assignDialogVisible.value = true;
      loadTechnicians();
    }
    async function handleAssign() {
      if (!assignTechId.value) {
        ElMessage.warning("请选择技师");
        return;
      }
      submitting.value = true;
      try {
        await updateOrderStatus(order.value.id, {
          status: "working",
          tech_id: assignTechId.value
        });
        ElMessage.success("指派成功");
        assignDialogVisible.value = false;
        await loadOrder();
      } catch (error) {
        console.error("指派技师失败", error);
      } finally {
        submitting.value = false;
      }
    }
    function showCompleteDialog() {
      completeFee.value = order.value.fee ? Number(order.value.fee) : 0;
      completeDialogVisible.value = true;
    }
    async function handleComplete() {
      submitting.value = true;
      try {
        const payload = { status: "done" };
        if (completeFee.value > 0) {
          payload.fee = completeFee.value;
        }
        await updateOrderStatus(order.value.id, payload);
        ElMessage.success("标记完工成功");
        completeDialogVisible.value = false;
        await loadOrder();
      } catch (error) {
        console.error("标记完工失败", error);
      } finally {
        submitting.value = false;
      }
    }
    async function handleReassign() {
      try {
        await ElMessageBox.confirm(
          '重新派单将清除当前技师指派，工单状态变为"待派单"，确认继续？',
          "确认重新派单",
          {
            confirmButtonText: "确认",
            cancelButtonText: "取消",
            type: "warning"
          }
        );
        submitting.value = true;
        await updateOrderStatus(order.value.id, {
          status: "pending"
        });
        ElMessage.success("已重新派单");
        await loadOrder();
      } catch (error) {
        if (error !== "cancel") {
          console.error("重新派单失败", error);
        }
      } finally {
        submitting.value = false;
      }
    }
    function showSettleDialog() {
      settleFee.value = order.value.fee ? Number(order.value.fee) : 0;
      settleDialogVisible.value = true;
    }
    async function handleSettle() {
      if (!settleFee.value || settleFee.value <= 0) {
        ElMessage.warning("请输入结算费用");
        return;
      }
      submitting.value = true;
      try {
        await updateOrderStatus(order.value.id, {
          status: "settled",
          fee: settleFee.value
        });
        ElMessage.success("结算成功");
        settleDialogVisible.value = false;
        await loadOrder();
      } catch (error) {
        console.error("结算失败", error);
      } finally {
        submitting.value = false;
      }
    }
    async function handleAddRemark() {
      const content = remarkContent.value.trim();
      if (!content) {
        return;
      }
      addingRemark.value = true;
      try {
        await addRemark(order.value.id, { content });
        ElMessage.success("备注添加成功");
        remarkContent.value = "";
        await loadOrder();
      } catch (error) {
        console.error("添加备注失败", error);
      } finally {
        addingRemark.value = false;
      }
    }
    watch(
      () => route.params.id,
      (newId) => {
        if (newId) {
          loadOrder();
        }
      }
    );
    onMounted(() => {
      loadOrder();
    });
    return (_ctx, _cache) => {
      const _component_ArrowLeft = resolveComponent("ArrowLeft");
      const _component_el_icon = resolveComponent("el-icon");
      const _component_el_button = resolveComponent("el-button");
      const _component_el_empty = resolveComponent("el-empty");
      const _component_el_descriptions_item = resolveComponent("el-descriptions-item");
      const _component_el_descriptions = resolveComponent("el-descriptions");
      const _component_el_card = resolveComponent("el-card");
      const _component_el_input = resolveComponent("el-input");
      const _component_el_option = resolveComponent("el-option");
      const _component_el_select = resolveComponent("el-select");
      const _component_el_form_item = resolveComponent("el-form-item");
      const _component_el_form = resolveComponent("el-form");
      const _component_el_dialog = resolveComponent("el-dialog");
      const _component_el_input_number = resolveComponent("el-input-number");
      const _directive_loading = resolveDirective("loading");
      return withDirectives((openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          createBaseVNode("div", _hoisted_3, [
            createVNode(_component_el_button, {
              text: "",
              onClick: goBack
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(_component_ArrowLeft)
                  ]),
                  _: 1
                }),
                _cache[10] || (_cache[10] = createTextVNode(" 返回列表 ", -1))
              ]),
              _: 1
            }),
            _cache[11] || (_cache[11] = createBaseVNode("h2", null, "工单详情", -1))
          ]),
          order.value ? (openBlock(), createElementBlock("div", _hoisted_4, [
            order.value.status === "pending" ? (openBlock(), createBlock(_component_el_button, {
              key: 0,
              type: "primary",
              onClick: showAssignDialog
            }, {
              default: withCtx(() => [..._cache[12] || (_cache[12] = [
                createTextVNode(" 指派技师 ", -1)
              ])]),
              _: 1
            })) : createCommentVNode("", true),
            order.value.status === "working" ? (openBlock(), createBlock(_component_el_button, {
              key: 1,
              type: "success",
              onClick: showCompleteDialog
            }, {
              default: withCtx(() => [..._cache[13] || (_cache[13] = [
                createTextVNode(" 标记完工 ", -1)
              ])]),
              _: 1
            })) : createCommentVNode("", true),
            order.value.status === "working" ? (openBlock(), createBlock(_component_el_button, {
              key: 2,
              type: "warning",
              onClick: handleReassign
            }, {
              default: withCtx(() => [..._cache[14] || (_cache[14] = [
                createTextVNode(" 重新派单 ", -1)
              ])]),
              _: 1
            })) : createCommentVNode("", true),
            order.value.status === "done" ? (openBlock(), createBlock(_component_el_button, {
              key: 3,
              type: "info",
              onClick: showSettleDialog
            }, {
              default: withCtx(() => [..._cache[15] || (_cache[15] = [
                createTextVNode(" 确认结算 ", -1)
              ])]),
              _: 1
            })) : createCommentVNode("", true)
          ])) : createCommentVNode("", true)
        ]),
        !loading.value && !order.value ? (openBlock(), createBlock(_component_el_empty, {
          key: 0,
          description: "工单不存在或已被删除"
        }, {
          default: withCtx(() => [
            createVNode(_component_el_button, {
              type: "primary",
              onClick: goBack
            }, {
              default: withCtx(() => [..._cache[16] || (_cache[16] = [
                createTextVNode("返回列表", -1)
              ])]),
              _: 1
            })
          ]),
          _: 1
        })) : createCommentVNode("", true),
        order.value ? (openBlock(), createBlock(_component_el_card, {
          key: 1,
          class: "info-card"
        }, {
          header: withCtx(() => [
            createBaseVNode("div", _hoisted_5, [
              _cache[17] || (_cache[17] = createBaseVNode("span", null, "工单信息", -1)),
              createVNode(_sfc_main$1, {
                status: order.value.status
              }, null, 8, ["status"])
            ])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_descriptions, {
              column: 2,
              border: ""
            }, {
              default: withCtx(() => [
                createVNode(_component_el_descriptions_item, {
                  label: "工单编号",
                  span: 1
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(order.value.order_no), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "当前状态",
                  span: 1
                }, {
                  default: withCtx(() => [
                    createVNode(_sfc_main$1, {
                      status: order.value.status
                    }, null, 8, ["status"])
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "客户姓名",
                  span: 1
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(order.value.customer_name), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "客户电话",
                  span: 1
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(order.value.customer_phone || "-"), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "维修地址",
                  span: 2
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(order.value.address), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "问题描述",
                  span: 2
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(order.value.description), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "指派技师",
                  span: 1
                }, {
                  default: withCtx(() => [
                    createBaseVNode("span", {
                      class: normalizeClass({ "text-muted": !order.value.tech_name })
                    }, toDisplayString(order.value.tech_name || "未指派"), 3)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "维修费用",
                  span: 1
                }, {
                  default: withCtx(() => [
                    order.value.fee && Number(order.value.fee) > 0 ? (openBlock(), createElementBlock("span", _hoisted_6, " ¥" + toDisplayString(Number(order.value.fee).toFixed(2)), 1)) : (openBlock(), createElementBlock("span", _hoisted_7, "未录入"))
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "创建时间",
                  span: 1
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(order.value.created_at), 1)
                  ]),
                  _: 1
                }),
                createVNode(_component_el_descriptions_item, {
                  label: "结算时间",
                  span: 1
                }, {
                  default: withCtx(() => [
                    createTextVNode(toDisplayString(order.value.settled_at || "-"), 1)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        })) : createCommentVNode("", true),
        order.value ? (openBlock(), createBlock(_component_el_card, {
          key: 2,
          class: "remarks-card"
        }, {
          header: withCtx(() => [..._cache[18] || (_cache[18] = [
            createBaseVNode("span", null, "维修备注", -1)
          ])]),
          default: withCtx(() => [
            createBaseVNode("div", _hoisted_8, [
              createVNode(_component_el_input, {
                modelValue: remarkContent.value,
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => remarkContent.value = $event),
                placeholder: "请输入备注内容",
                maxlength: "500",
                "show-word-limit": "",
                onKeyup: withKeys(handleAddRemark, ["enter"])
              }, null, 8, ["modelValue"]),
              createVNode(_component_el_button, {
                type: "primary",
                disabled: !remarkContent.value.trim(),
                loading: addingRemark.value,
                onClick: handleAddRemark,
                style: { "margin-left": "12px" }
              }, {
                default: withCtx(() => [..._cache[19] || (_cache[19] = [
                  createTextVNode(" 添加备注 ", -1)
                ])]),
                _: 1
              }, 8, ["disabled", "loading"])
            ]),
            order.value.remarks && order.value.remarks.length > 0 ? (openBlock(), createElementBlock("div", _hoisted_9, [
              (openBlock(true), createElementBlock(Fragment, null, renderList(order.value.remarks, (remark) => {
                return openBlock(), createElementBlock("div", {
                  key: remark.id,
                  class: "remark-item"
                }, [
                  createBaseVNode("div", _hoisted_10, [
                    createBaseVNode("span", _hoisted_11, toDisplayString(remark.creator_name || "未知"), 1),
                    createBaseVNode("span", _hoisted_12, toDisplayString(remark.created_at), 1)
                  ]),
                  createBaseVNode("div", _hoisted_13, toDisplayString(remark.content), 1)
                ]);
              }), 128))
            ])) : (openBlock(), createBlock(_component_el_empty, {
              key: 1,
              description: "暂无备注",
              "image-size": 60
            }))
          ]),
          _: 1
        })) : createCommentVNode("", true),
        createVNode(_component_el_dialog, {
          modelValue: assignDialogVisible.value,
          "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => assignDialogVisible.value = $event),
          title: "指派技师",
          width: "480px",
          "close-on-click-modal": false
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[2] || (_cache[2] = ($event) => assignDialogVisible.value = false)
            }, {
              default: withCtx(() => [..._cache[20] || (_cache[20] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              disabled: !assignTechId.value,
              loading: submitting.value,
              onClick: handleAssign
            }, {
              default: withCtx(() => [..._cache[21] || (_cache[21] = [
                createTextVNode(" 确认指派 ", -1)
              ])]),
              _: 1
            }, 8, ["disabled", "loading"])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_form, { "label-width": "80px" }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { label: "选择技师" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_select, {
                      modelValue: assignTechId.value,
                      "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => assignTechId.value = $event),
                      placeholder: "请选择技师",
                      style: { "width": "100%" },
                      filterable: ""
                    }, {
                      default: withCtx(() => [
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
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: completeDialogVisible.value,
          "onUpdate:modelValue": _cache[6] || (_cache[6] = ($event) => completeDialogVisible.value = $event),
          title: "标记完工",
          width: "480px",
          "close-on-click-modal": false
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[5] || (_cache[5] = ($event) => completeDialogVisible.value = false)
            }, {
              default: withCtx(() => [..._cache[22] || (_cache[22] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              loading: submitting.value,
              onClick: handleComplete
            }, {
              default: withCtx(() => [..._cache[23] || (_cache[23] = [
                createTextVNode(" 确认完工 ", -1)
              ])]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_form, { "label-width": "80px" }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { label: "维修费用" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input_number, {
                      modelValue: completeFee.value,
                      "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => completeFee.value = $event),
                      min: 0,
                      precision: 2,
                      step: 10,
                      placeholder: "请输入维修费用",
                      style: { "width": "100%" }
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createVNode(_component_el_dialog, {
          modelValue: settleDialogVisible.value,
          "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => settleDialogVisible.value = $event),
          title: "确认结算",
          width: "480px",
          "close-on-click-modal": false
        }, {
          footer: withCtx(() => [
            createVNode(_component_el_button, {
              onClick: _cache[8] || (_cache[8] = ($event) => settleDialogVisible.value = false)
            }, {
              default: withCtx(() => [..._cache[24] || (_cache[24] = [
                createTextVNode("取消", -1)
              ])]),
              _: 1
            }),
            createVNode(_component_el_button, {
              type: "primary",
              loading: submitting.value,
              onClick: handleSettle
            }, {
              default: withCtx(() => [..._cache[25] || (_cache[25] = [
                createTextVNode(" 确认结算 ", -1)
              ])]),
              _: 1
            }, 8, ["loading"])
          ]),
          default: withCtx(() => [
            createVNode(_component_el_form, { "label-width": "80px" }, {
              default: withCtx(() => [
                createVNode(_component_el_form_item, { label: "维修费用" }, {
                  default: withCtx(() => [
                    createVNode(_component_el_input_number, {
                      modelValue: settleFee.value,
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => settleFee.value = $event),
                      min: 0,
                      precision: 2,
                      step: 10,
                      placeholder: "请输入结算费用",
                      style: { "width": "100%" }
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            _cache[26] || (_cache[26] = createBaseVNode("p", { class: "settle-tip" }, '确认结算后，工单将变为"已结算"状态，不可再更改。', -1))
          ]),
          _: 1
        }, 8, ["modelValue"])
      ])), [
        [_directive_loading, loading.value]
      ]);
    };
  }
};
const OrderDetail = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e2bd28e6"]]);
export {
  OrderDetail as default
};
