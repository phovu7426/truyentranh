<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- Breadcrumb - Chỉ hiển thị khi KHÔNG có route con (route con sẽ tự render breadcrumb) -->
      <nav v-if="!hasChildRoute" class="mb-4">
        <ol class="flex items-center space-x-2 text-sm text-gray-600">
          <li>
            <NuxtLink to="/" class="hover:text-blue-600 transition-colors">Trang chủ</NuxtLink>
          </li>
          <li>
            <span class="mx-2">></span>
          </li>
          <li>
            <NuxtLink :to="`/home/comics/${comic?.slug}`" class="hover:text-blue-600 transition-colors">
              {{ comic?.title || 'Truyện tranh' }}
            </NuxtLink>
          </li>
        </ol>
      </nav>

      <!-- Loading State -->
      <div v-if="loading && !hasChildRoute" class="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div class="flex space-x-6">
          <div class="w-48 h-72 bg-gray-200 rounded flex-shrink-0"></div>
          <div class="flex-1">
            <div class="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div class="h-4 bg-gray-200 rounded w-1/2 mb-6"></div>
            <div class="space-y-3 mb-6">
              <div class="h-4 bg-gray-200 rounded w-full"></div>
              <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Comic Detail - Chỉ hiển thị khi KHÔNG có route con -->
      <div v-if="!hasChildRoute && comic" class="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div class="flex flex-col md:flex-row">
          <!-- Cover Image -->
          <div class="md:w-48 flex-shrink-0">
            <img
              :src="comic.cover_image || '/default.svg'"
              :alt="comic.title"
              class="w-full h-96 md:h-full object-cover"
              @error="handleImageError"
            />
          </div>

          <!-- Comic Info -->
          <div class="flex-1 p-6">
            <!-- Title -->
            <h1 class="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{{ comic.title }}</h1>
            
            <!-- Alternative Titles -->
            <div v-if="comic.alternative_titles" class="text-sm text-gray-600 mb-4">
              {{ comic.alternative_titles }}
            </div>

            <!-- Categories -->
            <div v-if="comic.categories && comic.categories.length > 0" class="flex flex-wrap gap-2 mb-2">
              <NuxtLink
                v-for="category in comic.categories"
                :key="category.id"
                :to="`/home/comics?category=${category.slug || category.id}`"
                class="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded hover:bg-blue-200 transition-colors"
              >
                {{ category.name }}
              </NuxtLink>
            </div>

            <!-- Tags -->
            <div v-if="comic.tags && comic.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
              <NuxtLink
                v-for="tag in comic.tags"
                :key="tag.id"
                :to="`/home/comics?search=${encodeURIComponent(tag.name)}`"
                class="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
              >
                {{ tag.name }}
              </NuxtLink>
            </div>

            <!-- Info Table -->
            <table class="w-full mb-4">
              <tbody class="divide-y divide-gray-200">
                <tr v-if="comic.translation_team">
                  <td class="py-2 text-sm text-gray-600 font-medium w-32">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                      Nhóm dịch
                    </div>
                  </td>
                  <td class="py-2 text-sm text-gray-900">
                    <NuxtLink
                      v-if="comic.translation_team.slug"
                      :to="`/team/${comic.translation_team.slug}`"
                      class="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      <img
                        v-if="comic.translation_team.avatar"
                        :src="comic.translation_team.avatar"
                        :alt="comic.translation_team.name"
                        class="w-6 h-6 rounded-full mr-2"
                        @error="handleImageError"
                      />
                      {{ comic.translation_team.name }}
                    </NuxtLink>
                    <span v-else>{{ comic.translation_team.name || comic.translation_team }}</span>
                  </td>
                </tr>
                <tr v-if="comic.author">
                  <td class="py-2 text-sm text-gray-600 font-medium">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      Tác giả
                    </div>
                  </td>
                  <td class="py-2 text-sm text-gray-900">
                    {{ comic.author }}
                  </td>
                </tr>
                <tr>
                  <td class="py-2 text-sm text-gray-600 font-medium">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Tình trạng
                    </div>
                  </td>
                  <td class="py-2 text-sm text-gray-900">
                    <span :class="comic.status === 'completed' ? 'text-green-600' : 'text-blue-600'">
                      {{ comic.status === 'completed' ? 'Hoàn thành' : 'Đang tiến hành' }}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td class="py-2 text-sm text-gray-600 font-medium">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Cập nhật
                    </div>
                  </td>
                  <td class="py-2 text-sm text-gray-900">
                    <span v-if="comic.last_chapter">{{ formatDate(comic.last_chapter.updated_at || comic.last_chapter.created_at) }}</span>
                    <span v-else>{{ formatLastUpdate() }}</span>
                  </td>
                </tr>
                <tr>
                  <td class="py-2 text-sm text-gray-600 font-medium">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                      </svg>
                      Thống kê tuần
                    </div>
                  </td>
                  <td class="py-2 text-sm text-gray-900">
                    <div class="flex items-center space-x-4">
                      <span class="flex items-center" :title="`${weeklyStats.views || 0} lượt xem trong tuần`">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        {{ formatNumber(weeklyStats.views || 0) }}
                      </span>
                      <span class="flex items-center" :title="`${weeklyStats.likes || 0} lượt thích trong tuần`">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                        {{ formatNumber(weeklyStats.likes || 0) }}
                      </span>
                      <span class="flex items-center" :title="`${weeklyStats.comments || 0} bình luận trong tuần`">
                        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h10m-7 4h7"></path>
                        </svg>
                        {{ formatNumber(weeklyStats.comments || 0) }}
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td class="py-2 text-sm text-gray-600 font-medium">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                      </svg>
                      Lượt xem
                    </div>
                  </td>
                  <td class="py-2 text-sm text-gray-900">{{ formatNumber(comic.stats?.view_count || 0) }}</td>
                </tr>
                <tr>
                  <td class="py-2 text-sm text-gray-600 font-medium">
                    <div class="flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                      </svg>
                      Lượt theo dõi
                    </div>
                  </td>
                  <td class="py-2 text-sm text-gray-900">{{ formatNumber(comic.stats?.follow_count || 0) }}</td>
                </tr>
              </tbody>
            </table>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-3 mb-4">
              <NuxtLink
                v-if="firstChapter && comic && comic.slug"
                :to="`/home/comics/${comic.slug}/chapters/${firstChapter.chapter_index}`"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Đọc từ đầu
              </NuxtLink>
              <button
                @click="toggleFollow"
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path>
                </svg>
                {{ isFollowing ? 'Đã theo dõi' : 'Theo dõi' }}
              </button>
              <button
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
                Báo lỗi
              </button>
              <button
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                </svg>
                Tặng quà
              </button>
              <button
                class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center"
              >
                <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                </svg>
                Đề cử
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Description Section - Chỉ hiển thị khi KHÔNG có route con -->
      <div v-if="!hasChildRoute && comic && comic.description" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 class="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          Giới thiệu
        </h3>
        <p class="text-gray-700 leading-relaxed whitespace-pre-line">{{ comic.description }}</p>
      </div>

      <!-- Chapters List Section - Chỉ hiển thị khi KHÔNG có route con -->
      <div v-if="!hasChildRoute" class="bg-white rounded-lg shadow-md p-6 mb-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-gray-900 flex items-center">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Danh sách chương
          </h3>
          <div class="flex items-center space-x-2">
            <input
              v-model="chapterSearch"
              type="text"
              placeholder="Nhập chapter"
              class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              @click="toggleChaptersList"
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              {{ showChaptersList ? 'Đóng' : 'Mở' }}
            </button>
          </div>
        </div>

        <div v-if="showChaptersList">
          <div v-if="chaptersLoading" class="space-y-2">
            <div v-for="i in 10" :key="i" class="h-12 bg-gray-200 rounded animate-pulse"></div>
          </div>

          <div v-else-if="filteredChapters.length > 0" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cập nhật</th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr
                  v-for="chapter in filteredChapters"
                  :key="chapter.id"
                  class="hover:bg-gray-50 transition-colors"
                >
                  <td class="px-4 py-3 whitespace-nowrap">
                    <NuxtLink
                      v-if="comic && comic.slug"
                      :to="`/home/comics/${comic.slug}/chapters/${chapter.chapter_index}`"
                      class="text-blue-600 hover:text-blue-700 font-medium text-sm block"
                    >
                      {{ chapter.title || `Chapter ${chapter.chapter_index}` }}
                    </NuxtLink>
                    <span v-else class="text-gray-500 text-sm">
                      {{ chapter.title || `Chapter ${chapter.chapter_index}` }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(chapter.created_at) }}
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-right">
                    <NuxtLink
                      v-if="comic && comic.slug"
                      :to="`/home/comics/${comic.slug}/chapters/${chapter.chapter_index}`"
                      class="inline-block"
                    >
                      <svg class="w-5 h-5 text-gray-400 hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </NuxtLink>
                    <span v-else class="inline-block">
                      <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="text-center py-8 text-gray-500">
            Không tìm thấy chương nào
          </div>
        </div>
      </div>

      <!-- Comments Section - Chỉ hiển thị khi KHÔNG có route con -->
      <div v-if="!hasChildRoute" class="bg-white rounded-xl shadow-lg p-6 lg:p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <svg class="w-7 h-7 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
          </svg>
          {{ totalComments }} Bình luận
        </h3>
        
        <!-- Comment Input -->
        <div class="mb-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
          <div class="flex items-start space-x-4">
            <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white">
              <img
                v-if="authStore.user?.avatar"
                :src="authStore.user.avatar"
                :alt="authStore.user.name"
                class="w-full h-full object-cover"
                @error="handleImageError"
              />
              <span v-else class="text-gray-700 font-bold">
                {{ authStore.user?.name?.charAt(0).toUpperCase() || 'U' }}
              </span>
            </div>
            <div class="flex-1">
              <textarea
                v-model="newComment"
                placeholder="Viết bình luận của bạn..."
                rows="4"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
              ></textarea>
              <div class="flex justify-end mt-3">
                <button
                  @click="submitComment"
                  :disabled="!newComment.trim()"
                  class="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
                  </svg>
                  Gửi bình luận
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Comments List -->
        <div v-if="commentsLoading" class="space-y-5">
          <div v-for="i in 5" :key="i" class="bg-gray-50 rounded-xl p-5 border border-gray-200 animate-pulse">
            <div class="flex space-x-4">
              <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div class="flex-1">
                <div class="h-4 bg-gray-300 rounded w-1/4 mb-3"></div>
                <div class="h-4 bg-gray-300 rounded w-full mb-2"></div>
                <div class="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>

        <div v-else-if="comments.length > 0" class="space-y-5">
          <div
            v-for="comment in comments"
            :key="comment.id"
            class="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div class="flex items-start space-x-4">
              <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center overflow-hidden flex-shrink-0 ring-2 ring-white shadow-sm">
                <img
                  v-if="comment.user?.avatar"
                  :src="comment.user.avatar"
                  :alt="comment.user?.name"
                  class="w-full h-full object-cover"
                  @error="handleImageError"
                />
                <span v-else class="text-gray-700 font-bold text-lg">
                  {{ comment.user?.name?.charAt(0).toUpperCase() || 'U' }}
                </span>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-2 mb-2">
                  <span class="font-semibold text-gray-900">{{ comment.user?.name || 'Người dùng' }}</span>
                  <span class="text-gray-400">·</span>
                  <span class="text-xs text-gray-500 flex items-center">
                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ formatDate(comment.created_at) }}
                  </span>
                </div>
                <p class="text-gray-800 mb-3 leading-relaxed whitespace-pre-wrap break-words">{{ comment.content }}</p>
                <div class="flex items-center space-x-4 pt-3 border-t border-gray-100">
                  <button class="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                    </svg>
                    {{ comment.likes_count || 0 }}
                  </button>
                  <button class="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"></path>
                    </svg>
                    Trả lời
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-8 text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      </div>

      <!-- BẮT BUỘC: Render route con (chapters) -->
      <NuxtPage />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { navigateTo } from '#app'
import { useGlobalApiClient } from '@/composables/api'
import { publicEndpoints, userEndpoints } from '@/api/endpoints'
import { useSeo } from '@/composables/seo'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const { apiClient } = useGlobalApiClient()
const authStore = useAuthStore()

// State
const loading = ref(false)
const comic = ref<any>(null)
const chapters = ref<any[]>([])
const chaptersLoading = ref(false)
const comments = ref<any[]>([])
const commentsLoading = ref(false)
const chapterSearch = ref('')
const showChaptersList = ref(true)
const newComment = ref('')
const isFollowing = ref(false)
const totalComments = ref(0)

// Computed
const firstChapter = computed(() => {
  // Lấy chương đầu tiên (chapter_index nhỏ nhất)
  if (!chapters.value || chapters.value.length === 0) return null
  return chapters.value.reduce((prev, current) => {
    return (prev.chapter_index < current.chapter_index) ? prev : current
  })
})

const filteredChapters = computed(() => {
  if (!chapterSearch.value.trim()) {
    return chapters.value
  }
  const search = chapterSearch.value.toLowerCase()
  return chapters.value.filter(chapter => {
    const title = chapter.title?.toLowerCase() || ''
    const index = chapter.chapter_index?.toString() || ''
    return title.includes(search) || index.includes(search)
  })
})

const weeklyStats = computed(() => {
  return comic.value?.stats?.weekly_stats || {
    views: 0,
    likes: 0,
    comments: 0
  }
})

// Kiểm tra xem có route con không (ví dụ: /chapters/265)
const hasChildRoute = computed(() => {
  return route.path.includes('/chapters/')
})

// Load data
onMounted(async () => {
  const path = route.path
  
  // Nếu có route con (ví dụ: /chapters/265), không load comic detail
  // Route con sẽ tự load data cần thiết
  if (hasChildRoute.value) {
    return
  }
  
  await Promise.all([
    loadComic(),
    loadChapters()
  ])
})

async function loadComic() {
  loading.value = true
  try {
    const slug = route.params.slug as string
    
    // Check if slug contains /chapters/ - if so, this is wrong route
    if (slug.includes('/chapters/')) {
      console.error('Invalid slug contains /chapters/, this should not happen')
      return
    }
    
    const response = await apiClient.get(publicEndpoints.comics.showBySlug(slug))
    if (response.data?.success) {
      comic.value = response.data.data
      // Sử dụng is_following từ API response
      isFollowing.value = comic.value.is_following || false
    }
  } catch (error) {
    console.error('Failed to load comic:', error)
  } finally {
    loading.value = false
  }
}

// Set SEO when comic is loaded
watch(() => comic.value, (newComic) => {
  if (newComic) {
    useSeo({
      title: newComic.title,
      description: newComic.description,
      image: newComic.cover_image,
      type: 'article',
      url: `/home/comics/${newComic.slug}`
    })
    loadComments()
  }
})

async function loadChapters() {
  chaptersLoading.value = true
  try {
    const response = await apiClient.get(publicEndpoints.comics.getChapters(route.params.slug as string), {
      params: {
        sort: 'chapter_index:ASC',
        limit: 500 // Lấy tất cả chương
      }
    })
    if (response.data?.success) {
      chapters.value = response.data.data || []
    }
  } catch (error) {
    console.error('Failed to load chapters:', error)
    chapters.value = []
  } finally {
    chaptersLoading.value = false
  }
}

async function loadComments() {
  if (!comic.value) return
  
  commentsLoading.value = true
  try {
    const response = await apiClient.get(publicEndpoints.comments.getByComic(comic.value.id))
    if (response.data?.success) {
      comments.value = response.data.data || []
      totalComments.value = response.data.total || comments.value.length
    }
  } catch (error) {
    console.error('Failed to load comments:', error)
    comments.value = []
  } finally {
    commentsLoading.value = false
  }
}

async function toggleFollow() {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  
  if (!comic.value) return
  
  try {
    if (isFollowing.value) {
      await apiClient.delete(userEndpoints.follows.unfollow(comic.value.id))
      isFollowing.value = false
      // Cập nhật trạng thái trong comic object
      if (comic.value) {
        comic.value.is_following = false
        comic.value.stats = comic.value.stats || {}
        comic.value.stats.follow_count = Math.max(0, (comic.value.stats.follow_count || 0) - 1)
      }
    } else {
      await apiClient.post(userEndpoints.follows.follow(comic.value.id))
      isFollowing.value = true
      // Cập nhật trạng thái trong comic object
      if (comic.value) {
        comic.value.is_following = true
        comic.value.stats = comic.value.stats || {}
        comic.value.stats.follow_count = (comic.value.stats.follow_count || 0) + 1
      }
    }
  } catch (error) {
    console.error('Failed to toggle follow:', error)
  }
}

async function submitComment() {
  if (!authStore.isAuthenticated) {
    router.push('/auth/login')
    return
  }
  
  if (!newComment.value.trim()) return
  
  try {
    await apiClient.post(userEndpoints.comments.create, {
      comic_id: comic.value.id,
      content: newComment.value.trim()
    })
    newComment.value = ''
    await loadComments()
  } catch (error) {
    console.error('Failed to submit comment:', error)
  }
}

function toggleChaptersList() {
  showChaptersList.value = !showChaptersList.value
}

async function handleChapterClick(event: Event, chapterId: number) {
  // Stop propagation to prevent row click
  event.stopPropagation()
  event.preventDefault()
  // Use navigateTo for navigation
  if (!comic.value || !comic.value.slug) {
    console.error('Comic not loaded yet, comic:', comic.value)
    return
  }
  const url = `/home/comics/${comic.value.slug}/chapters/${chapterId}`
  try {
    await navigateTo(url)
  } catch (err: any) {
    console.error('Navigation error:', err)
    // Fallback to router.push
    try {
      await router.push(url)
    } catch (err2) {
      console.error('Fallback navigation also failed:', err2)
    }
  }
}

async function handleRowClick(chapterId: number) {
  if (!comic.value || !comic.value.slug) {
    console.error('Comic not loaded yet, comic:', comic.value)
    return
  }
  const url = `/home/comics/${comic.value.slug}/chapters/${chapterId}`
  try {
    await navigateTo(url)
  } catch (err: any) {
    console.error('Navigation error:', err)
    // Fallback to router.push
    try {
      await router.push(url)
    } catch (err2) {
      console.error('Fallback navigation also failed:', err2)
    }
  }
}

function goToChapter(chapterId: number) {
  if (!comic.value || !comic.value.slug) {
    console.error('Comic not loaded yet')
    return
  }
  const url = `/home/comics/${comic.value.slug}/chapters/${chapterId}`
  router.push(url)
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'Chưa cập nhật'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return 'Chưa cập nhật'
    }
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 7) return `${days} ngày trước`
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    console.error('Error formatting date:', dateString, error)
    return 'Chưa cập nhật'
  }
}

function formatLastUpdate(): string {
  if (comic.value?.last_chapter) {
    return formatDate(comic.value.last_chapter.updated_at || comic.value.last_chapter.created_at)
  }
  if (!chapters.value || chapters.value.length === 0) return 'Chưa cập nhật'
  // Tìm chương mới nhất (chapter_index lớn nhất)
  const latestChapter = chapters.value.reduce((prev, current) => {
    return (prev.chapter_index > current.chapter_index) ? prev : current
  })
  return formatDate(latestChapter.updated_at || latestChapter.created_at)
}

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement
  img.src = '/default.svg'
}
</script>

