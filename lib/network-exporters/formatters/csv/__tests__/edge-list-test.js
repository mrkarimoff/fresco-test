/* eslint-env jest */
import { makeWriteableStream } from '../../../../config/setupTestEnv';
import {
  mockCodebook,
  mockExportOptions,
} from '../../../../config/mockObjects';
import {
  entityPrimaryKeyProperty,
  edgeSourceProperty,
  edgeTargetProperty,
  entityAttributesProperty,
  edgeExportIDProperty,
  egoProperty,
  ncUUIDProperty,
  ncSourceUUID,
  ncTargetUUID,
} from '@codaco/shared-consts';
import { EdgeListFormatter, asEdgeList, toCSVStream } from '../edge-list';

const nodes = [
  { [entityPrimaryKeyProperty]: 1 },
  { [entityPrimaryKeyProperty]: 2 },
  { [entityPrimaryKeyProperty]: 3 },
];

const listFromEdges = (edges, directed = false) =>
  asEdgeList({ edges, nodes }, mockCodebook, {
    ...mockExportOptions,
    globalOptions: {
      ...mockExportOptions.globalOptions,
      useDirectedEdges: directed,
    },
  });

describe('asEdgeList', () => {
  it('takes a network as input', () => {
    const network = {
      nodes: [],
      edges: [
        {
          [entityPrimaryKeyProperty]: 456,
          [edgeSourceProperty]: 'nodeA',
          [edgeTargetProperty]: 'nodeB',
          type: 'type',
          [entityAttributesProperty]: {},
        },
      ],
      ego: { [entityPrimaryKeyProperty]: 123 },
    };
    expect(asEdgeList(network, mockCodebook, mockExportOptions)[0]).toEqual({
      [entityPrimaryKeyProperty]: 456,
      [edgeTargetProperty]: 'nodeB',
      [edgeSourceProperty]: 'nodeA',
      type: 'type',
      [entityAttributesProperty]: {},
    });
  });

  it('represents an edgeless network', () => {
    expect(listFromEdges([])).toEqual([]);
  });

  it('represents a single undirected edge', () => {
    expect(
      listFromEdges([{ [edgeSourceProperty]: 1, [edgeTargetProperty]: 2 }]),
    ).toEqual([
      {
        [edgeSourceProperty]: 1,
        [edgeTargetProperty]: 2,
        [entityAttributesProperty]: {},
      },
    ]);
  });

  it('represents a single directed edge', () => {
    expect(
      listFromEdges(
        [{ [edgeSourceProperty]: 1, [edgeTargetProperty]: 2 }],
        true,
      ),
    ).toEqual([
      {
        [edgeSourceProperty]: 1,
        [edgeTargetProperty]: 2,
        [entityAttributesProperty]: {},
      },
    ]);
  });

  it('include egoID', () => {
    expect(
      listFromEdges(
        [
          {
            _egoID: 123,
            [edgeSourceProperty]: 1,
            [edgeTargetProperty]: 2,
          },
        ],
        true,
      ),
    ).toEqual([
      {
        _egoID: 123,
        [edgeSourceProperty]: 1,
        [edgeTargetProperty]: 2,
        [entityAttributesProperty]: {},
      },
    ]);
  });
});

describe('toCSVStream', () => {
  let writable;

  beforeEach(() => {
    writable = makeWriteableStream();
  });

  it('Writes a csv with attributes', async () => {
    const list = listFromEdges([
      {
        [entityPrimaryKeyProperty]: 123,
        [egoProperty]: 456,
        [edgeExportIDProperty]: 1,
        [ncSourceUUID]: 1,
        [ncTargetUUID]: 2,
        [edgeSourceProperty]: 1,
        [edgeTargetProperty]: 2,
        [entityAttributesProperty]: {
          a: 1,
        },
      },
    ]);
    toCSVStream(list, writable);
    const csv = await writable.asString();
    const result = [
      edgeExportIDProperty,
      edgeSourceProperty,
      edgeTargetProperty,
      egoProperty,
      ncUUIDProperty,
      ncSourceUUID,
      ncTargetUUID,
      'a\r\n1',
      1,
      2,
      456,
      123,
      1,
      2,
      '1\r\n',
    ].join(',');
    expect(csv).toEqual(result);
  });
});

describe('EdgeListFormatter', () => {
  let writable;

  beforeEach(() => {
    writable = makeWriteableStream();
  });

  it('writeToStream returns an abort controller', () => {
    const formatter = new EdgeListFormatter(
      {},
      mockCodebook,
      mockExportOptions,
    );
    const controller = formatter.writeToStream(writable);
    expect(controller.abort).toBeInstanceOf(Function);
  });
});
