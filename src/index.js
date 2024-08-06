import * as d3 from "d3";
import $ from "jquery";

/**
 * Adds tooltip functionality to the brush
 * @param tooltipId - tooltip id
 * @param brush - d3 brush
 * @param brushContainer - container element for brush
 * @param selectionToText - function for taking a d3 selection and converting it to the text to display in the tooltip
 * @param initialText - initial text to display
 * @param brushHoverElementSelectors - default selectors: [.selection, .handle--e, .handle--w], add selectors for any other element you add to the brush container that you'd like to show the popup while hovered over.
 * @param timeout - time to keep tooltip open when exiting the brush
 * @param updateTooltipLocationFn - function that determines where a tooltip should be placed, {pageX, pageY} are the arguments
 */
export function addTooltipToBrush(tooltipId, 
	brush,
	brushContainer, 
	selectionToText, 
	initialText, 
	brushHoverElementSelectors = [".selection", ".handle--e", ".handle--w"], 
	timeout = 200,
	updateTooltipLocationFn) {

	const tooltip = d3.select(tooltipId);
	let tooltipLocked = false;
	let hideTooltipTimeout = null;
	let tooltipText = initialText;
	tooltip.html(tooltipText);

	/**
	 * Locks the tooltip to prevent it from being hidden
	 */
	const lockTooltip = (e, show = true) => {
		clearHideTooltipTimeout();
		tooltipLocked = true;
		updateTooltipLocation(e);
		updateTooltipText(tooltipText);
		if (show) {
			showTooltip();
		}
	};

	/**
	 * Unlocks the tooltip
	 */
	const unlockTooltip = () => {
		tooltipLocked = false;
		hideTooltip();
	};

	/**
	 * Clear the hide tooltip timeout
	 */
	const clearHideTooltipTimeout = () => {
		if (hideTooltipTimeout) {
			clearTimeout(hideTooltipTimeout);
			hideTooltipTimeout = null;
		}
	};

	/**
	 * Hide the tooltip
	 */
	const hideTooltip = () => {
		clearHideTooltipTimeout();
		if (!tooltipLocked) {
			hideTooltipTimeout = setTimeout(() => {
				hideTooltipTimeout = null;
				$(tooltipId).fadeOut(150);
			}, timeout);
		}
	};

	/**
	 * Update the tooltip's location
	 * @param pageX
	 * @param pageY
	 */
	const updateTooltipLocation = updateTooltipLocationFn ? updateTooltipLocationFn : ({ pageX, pageY }) => {
		const jqTooltip = $(tooltipId);
		const doc = $(document);
		let left = pageX + 16;
		if (left + 280 >= doc.width()) {
			left = pageX - jqTooltip.outerWidth() - 16;
		}
		const scrollPos = doc.scrollTop();
		const halfLabelHeight = 16; 
		tooltip.style("left", left + "px").style("top", (pageY - scrollPos - halfLabelHeight) + "px");
	};

	const updateTooltipText = (text) => {
		tooltip.html(text);
	};

	/**
	 * Show the tooltip
	 */
	const showTooltip = () => {
		clearHideTooltipTimeout();
		$(tooltipId).fadeIn(150);
	};

	/**
	 * Update the tooltip's text and location
	 * @param {string} text 
	 * @param sourceEvent 
	 */
	const updateTooltip = (text, sourceEvent) => {
		if (sourceEvent && text) {
			tooltipText = text;
			updateTooltipLocation(sourceEvent);
			updateTooltipText(tooltipText);
		} else {
			hideTooltip();
		}
	}

	const startListener = brush.on("start");
	const brushListener = brush.on("brush");
	const endListener = brush.on("end");

	function handleBrush(event, show = true) {
		if (!event.sourceEvent) return;
		if (show && event.selection && event.selection[0] !== event.selection[1] && selectionToText(event) != null) { 
			showTooltip();
		}
		updateTooltip(selectionToText(event), event.sourceEvent);
	}

	function brushed(event) {
		if (brushListener) {
			brushListener(event);
		}
		handleBrush(event);
	};

	function brushEnd(event) {
		if (endListener) {
			endListener(event);
		}
		if (!event.sourceEvent) return;
		unlockTooltip();
		updateTooltip(selectionToText(event), event.sourceEvent);
	};

	function brushStart(event) {
		if (startListener) {
			startListener(event);
		}
		handleBrush(event, false);
	};

	// update brush listeners to include the modifications necessary for the tooltip
	brush.on("start", brushStart)
		.on("brush", brushed)
		.on("end", brushEnd);

	brushContainer
		.on("mouseup", () => {
			unlockTooltip();
		})
		.on("mousedown", (e) => {
			lockTooltip(e, false);
		});

	// add mouse event listeners to the components of the brush (selection div, east handle and west handle)
	const brushComponents = brushHoverElementSelectors.map(selector => brushContainer.selectAll(selector));
	
	// setup mouse event handling for the various components of a brush
	brushComponents.filter((component) => component != null).forEach((component) => {
		component
			.on("mouseover", () => {
				showTooltip();
			})
			.on("mousemove", (e) => {
				showTooltip();
				updateTooltipLocation(e);
				updateTooltipText(tooltipText);
			})
			.on("mouseup", () => {
				unlockTooltip();
			})
			.on("mouseout", () => {
				hideTooltip();
			})
			.on("mousedown", (e) => {
				lockTooltip(e);
			});
	});
}