import { ItemView, Plugin } from 'obsidian';

const MEDIUM_NODE_SIZE = 32;
const SMALL_NODE_SIZE = 17;
const EXTRA_SMALL_NODE_SIZE = 3;

function resizeNode(node: any, resizeType: 'tb' | 'lr', size: number) {
	const i = node.child;
	const textLength = !!i.text.length;
	const previewEl = i.previewMode.renderer.previewEl;
	if (!previewEl.isShown())
		return;
	if (resizeType === 'tb') {
		for (let o = 0; o < 10; o++) {
			const clientHeight = previewEl.clientHeight;
			previewEl.style.height = "1px";
			const scrollHeight = previewEl.scrollHeight;
			previewEl.style.height = "";
			const distance = scrollHeight - clientHeight + 1;
			if (Math.abs(distance) < .5)
				break;
			node.resize({
				width: textLength ? node.width : size,
				height: textLength ? (node.height + distance) : size
			});
			node.render();
			node.canvas.requestSave();
		}
		return;
	}
	previewEl.style.height = "1px";
	try {
		const scrollHeightForPreview = previewEl.scrollHeight + 0.1;
		let initialWidth = node.width;
		let min = 0;
		let max = initialWidth;

		for (let i = 0; i < 10; i++) {
			const mid = Math.round((min + max) / 2);
			node.resize({width: mid, height: node.height});
			node.render();

			if (previewEl.scrollHeight > scrollHeightForPreview) {
				min = mid;
			} else {
				max = mid;
			}

			if (max - min < 1) {
				break;
			}
		}

		node.resize({width: textLength ? max : size, height: textLength ? node.height : size});

		if (previewEl.scrollHeight > scrollHeightForPreview) {
			node.resize({width: initialWidth, height: node.height});
			node.render();
		} else {
			node.canvas.requestSave();
		}
	} finally {
		previewEl.style.height = "";
	}
}

export default class NodeResizePlugin extends Plugin {

    private reduceWidthAction = (node: any) => {
        node.resize({width: node.width - 1, height: node.height});
        node.render();
		node.canvas.requestSave();
    };

    private addCanvasNodeResizeCommand(id: string, name: string, nodeSize: number, resizeAction?: (node: any) => void) {
        const defaultResizeAction = (node: any) => {
            resizeNode(node, 'tb', nodeSize);
            resizeNode(node, 'lr', nodeSize);
        };

        this.addCommand({id, name, checkCallback: (checking: boolean) => {
            const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
            const viewType = canvasView?.getViewType();
            const canvas = (canvasView as any)?.canvas;
                if (canvas) {
                    // If checking is true, we're simply "checking" if the command can be run.
				    // If checking is false, then we want to actually perform the operation.
                    if (!checking) {
                        const selection: Set<any> = canvas.selection;
						const nodes = Array.from(selection.values());

                        if (nodes && nodes.length === 0) return;
						nodes.forEach((node) => (resizeAction ?? defaultResizeAction)(node));
                    }

                    // This command will only show up in Command Palette when the check function returns true
                    return true;
                }
            }
        });
    }

	async onload() {
        this.addCanvasNodeResizeCommand('canvas-node-resize-medium', 'Canvas node resize (medium)',  MEDIUM_NODE_SIZE);
        this.addCanvasNodeResizeCommand('canvas-node-resize-small', 'Canvas node resize (small)', SMALL_NODE_SIZE);
        this.addCanvasNodeResizeCommand('canvas-node-resize-extra-small', 'Canvas node resize (extra-small)', EXTRA_SMALL_NODE_SIZE);
        this.addCanvasNodeResizeCommand('canvas-node-resize-reduce-width', 'Canvas node resize (reduce width)', 0, this.reduceWidthAction);
	}

	onunload() {}
}
