import { ItemView, Plugin } from 'obsidian';

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

	async onload() {
		this.addCommand({
			id: 'canvas-node-resize-small',
			name: 'Canvas node resize (small)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				const viewType = canvasView?.getViewType();
				const canvas = (canvasView as any).canvas;
				if (canvas) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						const selection: Set<any> = canvas.selection;
						const nodes = Array.from(selection.values());

						if (nodes && nodes.length === 0) return;
						nodes.forEach((i) => {
							resizeNode(i, 'tb', SMALL_NODE_SIZE);
							resizeNode(i, 'lr', SMALL_NODE_SIZE);
						});
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
        this.addCommand({
			id: 'canvas-node-resize-extra-small',
			name: 'Canvas node resize (extra-small)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const canvasView = this.app.workspace.getActiveViewOfType(ItemView);
				const viewType = canvasView?.getViewType();
				const canvas = (canvasView as any).canvas;
				if (canvas) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						const selection: Set<any> = canvas.selection;
						const nodes = Array.from(selection.values());

						if (nodes && nodes.length === 0) return;
						nodes.forEach((i) => {
							resizeNode(i, 'tb', EXTRA_SMALL_NODE_SIZE);
							resizeNode(i, 'lr', EXTRA_SMALL_NODE_SIZE);
						});
					}

					// This command will only show up in Command Palette when the check function returns true
					return true;
				}
			}
		});
	}

	onunload() {

	}

}
