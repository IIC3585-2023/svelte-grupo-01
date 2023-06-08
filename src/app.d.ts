// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  // https://github.com/isaacHagoel/svelte-dnd-action#typescript
  declare type Item = import('svelte-dnd-action').Item;
  declare type DndEvent<ItemType = Item> = import('svelte-dnd-action').DndEvent<ItemType>;
  declare namespace svelte.JSX {
    interface HTMLAttributes<T> {
      onconsider?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
      onfinalize?: (event: CustomEvent<DndEvent<ItemType>> & { target: EventTarget & T }) => void;
    }
  }
}

export {};
