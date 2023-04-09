declare function plugin(options?: Partial<{ colors: object, rootSelector: string }>): { handler: () => void }

declare namespace plugin {
  const __isOptionsFunction: true
}

export = plugin
