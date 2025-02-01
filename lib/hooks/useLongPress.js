"use client";

import { useState, useCallback, useRef } from "react";

export default function useLongPress(
  onLongPress,
  onClick,
  { shouldPreventDefault = true, delay = 500 } = {}
) {
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const timeout = useRef();
  const target = useRef();
  const isPressed = useRef(false);

  const start = useCallback(
    (event) => {
      isPressed.current = true;

      if (shouldPreventDefault && event.target) {
        event.preventDefault();
        event.target.addEventListener("touchend", preventDefault, {
          passive: false,
        });
        target.current = event.target;
      }

      timeout.current = setTimeout(() => {
        if (isPressed.current) {
          onLongPress(event);
          setLongPressTriggered(true);
        }
      }, delay);
    },
    [onLongPress, delay, shouldPreventDefault]
  );

  const clear = useCallback(
    (event, shouldTriggerClick = true) => {
      // Clear the timeout to prevent the long press from triggering
      timeout.current && clearTimeout(timeout.current);
      isPressed.current = false;

      // If long press wasn't triggered, handle normal click
      if (!longPressTriggered && shouldTriggerClick) {
        onClick?.(event);
      }

      // Clean up touch event listener
      if (shouldPreventDefault && target.current) {
        target.current.removeEventListener("touchend", preventDefault);
      }
    },
    [shouldPreventDefault, onClick, longPressTriggered]
  );

  return {
    onMouseDown: start,
    onTouchStart: start,
    onMouseUp: (e) => {
      if (!longPressTriggered) {
        clear(e);
      }
    },
    onMouseLeave: (e) => {
      if (!longPressTriggered) {
        clear(e, false);
      }
    },
    onTouchEnd: (e) => {
      if (!longPressTriggered) {
        clear(e);
      } else {
        // Prevent any default behavior when long press is triggered
        preventDefault(e);
      }
    },
    onClick: (e) => {
      if (longPressTriggered) {
        preventDefault(e);
      } else {
        onClick?.(e);
      }
    },
  };
}

const preventDefault = (event) => {
  if (!event.cancelable) return;
  event.preventDefault();
  event.stopPropagation();
  return false;
};
