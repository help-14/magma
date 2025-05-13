import { createAsync, type RouteDefinition } from '@solidjs/router'
import { getUser, logout } from '~/lib'
import Nav from '~/components/Nav'
import { Flex } from '~/components/ui/flex'
import { For } from 'solid-js'
import Weather from '~/components/Weather'
import SearchBox from '~/components/SearchBox'

export const route = {
  preload() {
    getUser()
  }
} satisfies RouteDefinition

export default function Home() {
  const user = createAsync(() => getUser(), { deferStream: true })

  return (
    <div class="w-full h-full">
      <div
        class="w-full h-full fixed -mt-5 bg-cover bg-no-repeat transform scale-120 filter blur-sm opacity-60 -z-50"
        style="background-image: var(--bgImage);"
      ></div>
      <Nav />
      <main class="text-center mx-auto text-gray-700 p-4">
        <SearchBox />
        <Weather />
        <Flex flexDirection="col">
          <For each={[]}>
            {(group) => (
              <div class="flex flex-col">
                {/* <span class="font-bold text-3xl mt-10 mb-5">{group.title}</span>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <For each={group.data}>
                    {(col) => (
                      <div class="group-items flex flex-col gap-3">
                        <span class="accent">{col.title}</span>
                        <For each={(col as GroupItem).data}>
                          {(bm) => <Bookmark data={bm as BookmarkItem} />}
                        </For>
                      </div>
                    )}
                  </For>
                </div> */}
              </div>
            )}
          </For>
        </Flex>
      </main>
    </div>
  )
}
