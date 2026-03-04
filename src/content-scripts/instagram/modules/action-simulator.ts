import { randomDelay as delay } from '../../../shared/utils';
import { TYPING_DELAY_MIN, TYPING_DELAY_MAX, CLICK_DELAY_MIN, CLICK_DELAY_MAX } from '../../../shared/constants';

export async function simulateTyping(
  element: HTMLElement,
  text: string
): Promise<void> {
  element.focus();

  const isContentEditable = element.getAttribute('contenteditable') === 'true';

  if (isContentEditable) {
    await typeIntoContentEditable(element, text);
  } else {
    await typeIntoInput(element as HTMLTextAreaElement | HTMLInputElement, text);
  }
}

async function typeIntoInput(
  element: HTMLTextAreaElement | HTMLInputElement,
  text: string
): Promise<void> {
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(element),
    'value'
  )?.set;

  for (const char of text) {
    element.dispatchEvent(
      new KeyboardEvent('keydown', { key: char, bubbles: true })
    );

    const currentValue = element.value;
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(element, currentValue + char);
    }

    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(
      new KeyboardEvent('keyup', { key: char, bubbles: true })
    );

    await delay(TYPING_DELAY_MIN, TYPING_DELAY_MAX);
  }
}

async function typeIntoContentEditable(
  element: HTMLElement,
  text: string
): Promise<void> {
  for (const char of text) {
    element.dispatchEvent(
      new KeyboardEvent('keydown', { key: char, bubbles: true })
    );

    // Use execCommand for contenteditable (works with React)
    document.execCommand('insertText', false, char);

    element.dispatchEvent(
      new KeyboardEvent('keyup', { key: char, bubbles: true })
    );

    await delay(TYPING_DELAY_MIN, TYPING_DELAY_MAX);
  }
}

export async function simulateClick(element: Element): Promise<void> {
  const rect = element.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  const eventInit: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
    button: 0,
  };

  element.dispatchEvent(new MouseEvent('mousedown', eventInit));
  await delay(50, 150);
  element.dispatchEvent(new MouseEvent('mouseup', eventInit));
  element.dispatchEvent(new MouseEvent('click', eventInit));

  await delay(CLICK_DELAY_MIN, CLICK_DELAY_MAX);
}

export async function simulateEnter(element: Element): Promise<void> {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })
  );
  element.dispatchEvent(
    new KeyboardEvent('keyup', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true })
  );
}

export { delay as randomDelay };
