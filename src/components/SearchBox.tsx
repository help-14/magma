import { type Component } from 'solid-js'

const SearchBox: Component = () => {
  let searchBox: HTMLInputElement | ((el: HTMLInputElement) => void) | undefined

  const onPress = (key: string): void => {
    const query = (searchBox as HTMLInputElement)?.value?.trim()
    if (query && key === 'Enter') {
      window.location.href = `https://google.com/search?q=${query}`
    }
  }

  return (
    <>
      <style>
        {`
          ::placeholder {
            color: var(--foreground);
            opacity: 0.5;
          }

          ::-ms-input-placeholder {
            color: var(--foreground);
            opacity: 0.5;
          }
        `}
      </style>
      <div class="mb-5">
        <input
          ref={searchBox}
          type="text"
          placeholder="🔍 type something to search..."
          onKeyDown={(e) => onPress(e.key)}
          value=""
          class="border-transparent border-0 bg-transparent p-1 !outline-none"
          style={{
            'border-bottom': '1px solid var(--foreground)',
            'border-radius': '0',
            width: '100%'
          }}
        />
      </div>
    </>
  )
}

export default SearchBox
