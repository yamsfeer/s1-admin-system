import { _ as _export_sfc, u as useUserStore, h as ref, z as watch, v as onMounted, o as openBlock, c as createElementBlock, f as createBaseVNode, i as createBlock, w as withCtx, k as createCommentVNode, a as createVNode, A as withDirectives, j as useRoute, m as computed, r as resolveComponent, B as resolveDirective, g as reactive, b as useRouter, e as createTextVNode, C as normalizeClass, t as toDisplayString, E as ElMessage } from "./index-CEcSfnM8.js";
import { g as getOrderList, e as exportOrders } from "./orders-CUH8JNX4.js";
import { _ as _sfc_main$1 } from "./StatusTag-Gw5iEzJk.js";
const _hoisted_1 = { class: "order-list-page" };
const _hoisted_2 = { class: "page-header" };
const _hoisted_3 = { class: "header-actions" };
const _hoisted_4 = { class: "search-bar" };
const _hoisted_5 = { class: "pagination-wrapper" };
const _sfc_main = {
  __name: "OrderList",
  setup(__props) {
    const router = useRouter();
    const route = useRoute();
    const userStore = useUserStore();
    const isAdmin = computed(() => userStore.isAdmin);
    const activeStatus = ref(route.query.status || "");
    const searchKeyword = ref("");
    let searchTimer = null;
    const pagination = reactive({
      page: 1,
      size: 10,
      total: 0
    });
    const orderList = ref([]);
    const loading = ref(false);
    async function loadOrders() {
      loading.value = true;
      try {
        const params = {
          page: pagination.page,
          size: pagination.size
        };
        if (activeStatus.value) {
          params.status = activeStatus.value;
        }
        if (searchKeyword.value.trim()) {
          params.keyword = searchKeyword.value.trim();
        }
        const res = await getOrderList(params);
        orderList.value = res.data.list || [];
        pagination.total = res.data.total || 0;
      } catch (error) {
        console.error("加载工单列表失败", error);
      } finally {
        loading.value = false;
      }
    }
    function handleStatusChange() {
      pagination.page = 1;
      loadOrders();
    }
    watch(searchKeyword, () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
      searchTimer = setTimeout(() => {
        pagination.page = 1;
        loadOrders();
      }, 500);
    });
    function handleSearch() {
      pagination.page = 1;
      loadOrders();
    }
    function handlePageChange(page) {
      pagination.page = page;
      loadOrders();
    }
    function handleSizeChange(size) {
      pagination.size = size;
      pagination.page = 1;
      loadOrders();
    }
    function handleRowClick(row) {
      router.push(`/orders/${row.id}`);
    }
    function getRowClassName({ row }) {
      if (row.status === "pending") {
        return "status-pending";
      }
      return "";
    }
    function handleCreate() {
      router.push("/orders/create");
    }
    async function handleExport() {
      try {
        const params = {};
        if (activeStatus.value) {
          params.status = activeStatus.value;
        }
        if (searchKeyword.value.trim()) {
          params.keyword = searchKeyword.value.trim();
        }
        const res = await exportOrders(params);
        const contentDisposition = res.headers["content-disposition"];
        let filename = "orders.xlsx";
        if (contentDisposition) {
          const match = contentDisposition.match(/filename=([^;]+)/);
          if (match) {
            filename = match[1].trim().replace(/"/g, "");
          }
        }
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
        ElMessage.success("导出成功");
      } catch (error) {
        console.error("导出失败", error);
        ElMessage.error("导出失败");
      }
    }
    onMounted(() => {
      loadOrders();
    });
    return (_ctx, _cache) => {
      const _component_Plus = resolveComponent("Plus");
      const _component_el_icon = resolveComponent("el-icon");
      const _component_el_button = resolveComponent("el-button");
      const _component_Download = resolveComponent("Download");
      const _component_el_tab_pane = resolveComponent("el-tab-pane");
      const _component_el_tabs = resolveComponent("el-tabs");
      const _component_Search = resolveComponent("Search");
      const _component_el_input = resolveComponent("el-input");
      const _component_el_table_column = resolveComponent("el-table-column");
      const _component_el_table = resolveComponent("el-table");
      const _component_el_pagination = resolveComponent("el-pagination");
      const _directive_loading = resolveDirective("loading");
      return openBlock(), createElementBlock("div", _hoisted_1, [
        createBaseVNode("div", _hoisted_2, [
          _cache[6] || (_cache[6] = createBaseVNode("h2", null, "工单管理", -1)),
          createBaseVNode("div", _hoisted_3, [
            isAdmin.value ? (openBlock(), createBlock(_component_el_button, {
              key: 0,
              type: "primary",
              onClick: handleCreate
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(_component_Plus)
                  ]),
                  _: 1
                }),
                _cache[4] || (_cache[4] = createTextVNode(" 新建工单 ", -1))
              ]),
              _: 1
            })) : createCommentVNode("", true),
            isAdmin.value ? (openBlock(), createBlock(_component_el_button, {
              key: 1,
              type: "success",
              onClick: handleExport
            }, {
              default: withCtx(() => [
                createVNode(_component_el_icon, null, {
                  default: withCtx(() => [
                    createVNode(_component_Download)
                  ]),
                  _: 1
                }),
                _cache[5] || (_cache[5] = createTextVNode(" 导出Excel ", -1))
              ]),
              _: 1
            })) : createCommentVNode("", true)
          ])
        ]),
        createVNode(_component_el_tabs, {
          modelValue: activeStatus.value,
          "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => activeStatus.value = $event),
          class: "status-tabs",
          onTabChange: handleStatusChange
        }, {
          default: withCtx(() => [
            createVNode(_component_el_tab_pane, {
              label: "全部",
              name: ""
            }),
            createVNode(_component_el_tab_pane, {
              label: "待派单",
              name: "pending"
            }),
            createVNode(_component_el_tab_pane, {
              label: "进行中",
              name: "working"
            }),
            createVNode(_component_el_tab_pane, {
              label: "已完工",
              name: "done"
            }),
            createVNode(_component_el_tab_pane, {
              label: "已结算",
              name: "settled"
            })
          ]),
          _: 1
        }, 8, ["modelValue"]),
        createBaseVNode("div", _hoisted_4, [
          createVNode(_component_el_input, {
            modelValue: searchKeyword.value,
            "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => searchKeyword.value = $event),
            placeholder: "搜索客户姓名、维修地址、问题描述",
            clearable: "",
            style: { "width": "400px" },
            onClear: handleSearch
          }, {
            prefix: withCtx(() => [
              createVNode(_component_el_icon, null, {
                default: withCtx(() => [
                  createVNode(_component_Search)
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"])
        ]),
        withDirectives((openBlock(), createBlock(_component_el_table, {
          data: orderList.value,
          stripe: "",
          border: "",
          "highlight-current-row": "",
          class: "order-table",
          "row-class-name": getRowClassName,
          onRowClick: handleRowClick
        }, {
          default: withCtx(() => [
            createVNode(_component_el_table_column, {
              prop: "order_no",
              label: "工单编号",
              width: "150"
            }),
            createVNode(_component_el_table_column, {
              prop: "customer_name",
              label: "客户姓名",
              width: "120"
            }),
            createVNode(_component_el_table_column, {
              prop: "address",
              label: "维修地址",
              "min-width": "180",
              "show-overflow-tooltip": ""
            }),
            createVNode(_component_el_table_column, {
              prop: "description",
              label: "问题描述",
              "min-width": "200",
              "show-overflow-tooltip": ""
            }),
            createVNode(_component_el_table_column, {
              label: "状态",
              width: "100",
              align: "center"
            }, {
              default: withCtx(({ row }) => [
                createVNode(_sfc_main$1, {
                  status: row.status
                }, null, 8, ["status"])
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "tech_name",
              label: "指派技师",
              width: "120"
            }, {
              default: withCtx(({ row }) => [
                createBaseVNode("span", {
                  class: normalizeClass({ "text-danger": !row.tech_name })
                }, toDisplayString(row.tech_name || "未指派"), 3)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "fee",
              label: "维修费用",
              width: "120",
              align: "right"
            }, {
              default: withCtx(({ row }) => [
                createTextVNode(toDisplayString(row.fee ? `¥${Number(row.fee).toFixed(2)}` : "-"), 1)
              ]),
              _: 1
            }),
            createVNode(_component_el_table_column, {
              prop: "created_at",
              label: "创建时间",
              width: "170"
            })
          ]),
          _: 1
        }, 8, ["data"])), [
          [_directive_loading, loading.value]
        ]),
        createBaseVNode("div", _hoisted_5, [
          createVNode(_component_el_pagination, {
            "current-page": pagination.page,
            "onUpdate:currentPage": _cache[2] || (_cache[2] = ($event) => pagination.page = $event),
            "page-size": pagination.size,
            "onUpdate:pageSize": _cache[3] || (_cache[3] = ($event) => pagination.size = $event),
            "page-sizes": [10, 20, 50],
            total: pagination.total,
            layout: "total, sizes, prev, pager, next, jumper",
            onSizeChange: handleSizeChange,
            onCurrentChange: handlePageChange
          }, null, 8, ["current-page", "page-size", "total"])
        ])
      ]);
    };
  }
};
const OrderList = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-975d7ab2"]]);
export {
  OrderList as default
};
