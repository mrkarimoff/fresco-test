import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import Node from '../../components/Node';
import { DragSource } from '../../behaviours/DragAndDrop';
import { NO_SCROLL } from '../../behaviours/DragAndDrop/DragManager';
import { getEntityAttributes } from '../../ducks/modules/network';

const EnhancedNode = compose(DragSource)(Node);

class LayoutNode extends PureComponent {
  render() {
    const {
      allowPositioning = false,
      allowSelect = false,
      layoutVariable,
      linking = false,
      node,
      selected = false,
      onSelected,
    } = this.props;
    const nodeAttributes = getEntityAttributes(node);

    const { x, y } = nodeAttributes[layoutVariable];

    const styles = {
      left: `${100 * x}%`,
      top: `${100 * y}%`,
      transform: 'translate(-50%, -50%)',
    };

    return (
      <div
        className="node-layout__node"
        style={styles}
        onClick={() => onSelected?.()}
      >
        <EnhancedNode
          selected={selected}
          linking={linking}
          allowDrag={allowPositioning}
          allowSelect={allowSelect}
          meta={() => ({ ...node, itemType: 'POSITIONED_NODE' })}
          animate={false}
          scrollDirection={NO_SCROLL}
          {...node}
        />
      </div>
    );
  }
}

LayoutNode.propTypes = {
  allowPositioning: PropTypes.bool,
  allowSelect: PropTypes.bool,
  areaHeight: PropTypes.number,
  areaWidth: PropTypes.number,
  layoutVariable: PropTypes.string.isRequired,
  linking: PropTypes.bool,
  node: PropTypes.object.isRequired,
  onSelected: PropTypes.func,
  selected: PropTypes.bool,
};

export { LayoutNode };

export default LayoutNode;
