declare function plugin(options?: Partial<{ colors: string[] }>): { handler: () => void }

declare namespace plugin {
  const __isOptionsFunction: true
}

export = plugin
