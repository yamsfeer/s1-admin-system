import { r as resolveComponent, o as openBlock, i as createBlock, w as withCtx, e as createTextVNode, t as toDisplayString, m as computed } from "./index-CEcSfnM8.js";
const _sfc_main = {
  __name: "StatusTag",
  props: {
    status: {
      type: String,
      required: true
    }
  },
  setup(__props) {
    const props = __props;
    const STATUS_MAP = {
      pending: { label: "待派单", type: "danger" },
      working: { label: "进行中", type: "warning" },
      done: { label: "已完工", type: "success" },
      settled: { label: "已结算", type: "info" }
    };
    const label = computed(() => {
      var _a;
      return ((_a = STATUS_MAP[props.status]) == null ? void 0 : _a.label) || props.status;
    });
    const tagType = computed(() => {
      var _a;
      return ((_a = STATUS_MAP[props.status]) == null ? void 0 : _a.type) || "info";
    });
    return (_ctx, _cache) => {
      const _component_el_tag = resolveComponent("el-tag");
      return openBlock(), createBlock(_component_el_tag, {
        type: tagType.value,
        size: "small"
      }, {
        default: withCtx(() => [
          createTextVNode(toDisplayString(label.value), 1)
        ]),
        _: 1
      }, 8, ["type"]);
    };
  }
};
export {
  _sfc_main as _
};
