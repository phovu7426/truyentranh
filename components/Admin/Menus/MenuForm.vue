<template>
  <Modal v-model="modalVisible" :title="formTitle" size="xl" :loading="isSubmitting">
    <form @submit.prevent="validateAndSubmit" class="space-y-6" @click.stop>
      
      <!-- Basic Information Section -->
      <div class="space-y-6">
        <div class="border-b border-gray-200 pb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <svg class="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Thông tin cơ bản
          </h3>
          <p class="text-sm text-gray-600 mt-1">Nhập thông tin cơ bản của menu</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Code -->
          <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-2">
              Code <span class="text-red-500">*</span>
            </label>
            <input
              id="code"
              v-model="formData.code"
              type="text"
              placeholder="Mã menu (unique, 3-120 ký tự)"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.code || (apiErrors && apiErrors.code) }"
              :disabled="isEdit"
            />
            <p v-if="validationErrors.code" class="mt-2 text-sm text-red-600">{{ validationErrors.code }}</p>
            <p v-else-if="apiErrors && apiErrors.code" class="mt-2 text-sm text-red-600">{{ apiErrors.code[0] }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Mã menu phải unique, 3-120 ký tự</p>
          </div>

          <!-- Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-2">
              Tên menu <span class="text-red-500">*</span>
            </label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              placeholder="Tên menu"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.name || (apiErrors && apiErrors.name) }"
            />
            <p v-if="validationErrors.name" class="mt-2 text-sm text-red-600">{{ validationErrors.name }}</p>
            <p v-else-if="apiErrors && apiErrors.name" class="mt-2 text-sm text-red-600">{{ apiErrors.name[0] }}</p>
          </div>

          <!-- Path -->
          <div>
            <label for="path" class="block text-sm font-medium text-gray-700 mb-2">
              Path
            </label>
            <input
              id="path"
              v-model="formData.path"
              type="text"
              placeholder="/admin/dashboard"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.path || (apiErrors && apiErrors.path) }"
            />
            <p v-if="validationErrors.path" class="mt-2 text-sm text-red-600">{{ validationErrors.path }}</p>
            <p v-else-if="apiErrors && apiErrors.path" class="mt-2 text-sm text-red-600">{{ apiErrors.path[0] }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Đường dẫn route (ví dụ: /admin/dashboard)</p>
          </div>

          <!-- API Path -->
          <div>
            <label for="api_path" class="block text-sm font-medium text-gray-700 mb-2">
              API Path
            </label>
            <input
              id="api_path"
              v-model="formData.api_path"
              type="text"
              placeholder="/api/admin/dashboard"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :class="{ 'border-red-500 ring-2 ring-red-200': validationErrors.api_path || (apiErrors && apiErrors.api_path) }"
            />
            <p v-if="validationErrors.api_path" class="mt-2 text-sm text-red-600">{{ validationErrors.api_path }}</p>
            <p v-else-if="apiErrors && apiErrors.api_path" class="mt-2 text-sm text-red-600">{{ apiErrors.api_path[0] }}</p>
            <p v-else class="mt-1 text-xs text-gray-500">Đường dẫn API (ví dụ: /api/admin/dashboard)</p>
          </div>

          <!-- Icon -->
          <div>
            <label for="icon" class="block text-sm font-medium text-gray-700 mb-2">
              Icon
            </label>
            <input
              id="icon"
              v-model="formData.icon"
              type="text"
              placeholder="mdi-view-dashboard hoặc emoji"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">Icon class/name hoặc emoji (ví dụ: mdi-view-dashboard, 📊)</p>
          </div>

          <!-- Type -->
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700 mb-2">
              Loại menu
            </label>
            <select
              id="type"
              v-model="formData.type"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="route">Route</option>
              <option value="group">Group</option>
              <option value="link">Link</option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Route: menu route nội bộ, Group: menu group, Link: menu link ngoài</p>
          </div>

          <!-- Status -->
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              id="status"
              v-model="formData.status"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option v-for="status in statusEnums" :key="status.value" :value="status.value">
                {{ status.label }}
              </option>
            </select>
          </div>

          <!-- Parent Menu -->
          <div>
            <label for="parent_id" class="block text-sm font-medium text-gray-700 mb-2">
              Menu cha
            </label>
            <select
              id="parent_id"
              v-model="formData.parent_id"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option :value="null">Root (Không có menu cha)</option>
              <option 
                v-for="menu in filteredParentMenus" 
                :key="menu.id" 
                :value="menu.id"
              >
                {{ getMenuPath(menu) }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Chọn menu cha (để tạo menu con)</p>
          </div>

          <!-- Sort Order -->
          <div>
            <label for="sort_order" class="block text-sm font-medium text-gray-700 mb-2">
              Thứ tự sắp xếp
            </label>
            <input
              id="sort_order"
              v-model.number="formData.sort_order"
              type="number"
              min="0"
              placeholder="0"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p class="mt-1 text-xs text-gray-500">Số càng nhỏ, hiển thị càng trước</p>
          </div>

          <!-- Required Permission -->
          <div>
            <label for="required_permission_id" class="block text-sm font-medium text-gray-700 mb-2">
              Permission bắt buộc
            </label>
            <select
              id="required_permission_id"
              v-model="formData.required_permission_id"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option :value="null">Không có (Menu mặc định)</option>
              <option 
                v-for="perm in permissions" 
                :key="perm.id" 
                :value="perm.id"
              >
                {{ perm.name }} ({{ perm.code }})
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">Permission bắt buộc để truy cập menu này</p>
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center">
              <input
                v-model="formData.is_public"
                type="checkbox"
                id="is_public"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="is_public" class="ml-2 text-sm font-medium text-gray-700">
                Menu công khai
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500 ml-6">Menu có thể truy cập mà không cần permission</p>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <div class="flex items-center">
              <input
                v-model="formData.show_in_menu"
                type="checkbox"
                id="show_in_menu"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="show_in_menu" class="ml-2 text-sm font-medium text-gray-700">
                Hiển thị trong menu
              </label>
            </div>
            <p class="mt-1 text-xs text-gray-500 ml-6">Hiển thị menu trong sidebar</p>
          </div>
        </div>
      </div>

      <!-- Form Actions -->
      <div class="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          @click="handleClose"
          class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Hủy
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ isSubmitting ? 'Đang xử lý...' : (isEdit ? 'Cập nhật' : 'Tạo mới') }}
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import { MenuType, BasicStatus } from '@/types/menu'

const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  menu: {
    type: Object,
    default: null
  },
  statusEnums: {
    type: Array,
    default: () => []
  },
  parentMenus: {
    type: Array,
    default: () => []
  },
  permissions: {
    type: Array,
    default: () => []
  },
  apiErrors: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close', 'created', 'updated'])

const modalVisible = computed({
  get: () => props.show,
  set: (value) => {
    if (!value) {
      emit('close')
    }
  }
})

const isEdit = computed(() => !!props.menu)

const formTitle = computed(() => isEdit.value ? 'Chỉnh sửa menu' : 'Thêm menu mới')

const formData = ref({
  code: '',
  name: '',
  path: null,
  api_path: null,
  icon: null,
  type: MenuType.ROUTE,
  status: BasicStatus.ACTIVE,
  parent_id: null,
  sort_order: 0,
  is_public: false,
  show_in_menu: true,
  required_permission_id: null
})

const validationErrors = ref({})
const isSubmitting = ref(false)

// Filter parent menus to exclude current menu and its children (to prevent circular reference)
const filteredParentMenus = computed(() => {
  // Đảm bảo parentMenus là array và có dữ liệu
  const menus = Array.isArray(props.parentMenus) ? props.parentMenus : []
  
  // Nếu không có menu nào, trả về array rỗng ngay
  if (menus.length === 0) {
    return []
  }
  
  if (!isEdit.value || !props.menu || !props.menu.id) {
    return flattenMenus(menus)
  }
  
  const excludeIds = [props.menu.id]
  const getChildrenIds = (menu) => {
    if (menu && menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
      menu.children.forEach(child => {
        if (child && child.id) {
          excludeIds.push(child.id)
          getChildrenIds(child)
        }
      })
    }
  }
  
  // Find current menu in tree and exclude it and its children
  const findAndExclude = (menusArray) => {
    if (!Array.isArray(menusArray) || menusArray.length === 0) {
      return
    }
    menusArray.forEach(menu => {
      if (menu && menu.id === props.menu.id) {
        getChildrenIds(menu)
      } else if (menu && menu.children && Array.isArray(menu.children)) {
        findAndExclude(menu.children)
      }
    })
  }
  
  findAndExclude(menus)
  
  const flattened = flattenMenus(menus)
  return flattened.filter(menu => menu && menu.id && !excludeIds.includes(menu.id))
})

// Flatten menu tree to array
function flattenMenus(menus, level = 0) {
  const result = []
  if (!Array.isArray(menus) || menus.length === 0) {
    return result
  }
  menus.forEach(menu => {
    if (!menu || !menu.id) {
      return
    }
    const prefix = '  '.repeat(level)
    result.push({
      ...menu,
      displayName: `${prefix}${menu.name || ''}`
    })
    if (menu.children && Array.isArray(menu.children) && menu.children.length > 0) {
      result.push(...flattenMenus(menu.children, level + 1))
    }
  })
  return result
}

// Get menu path for display
function getMenuPath(menu) {
  if (menu.displayName) {
    return menu.displayName
  }
  return menu.name
}

// Watch for menu prop changes
watch(() => props.menu, (newMenu) => {
  if (newMenu) {
    formData.value = {
      code: newMenu.code || '',
      name: newMenu.name || '',
      path: newMenu.path || null,
      api_path: newMenu.api_path || null,
      icon: newMenu.icon || null,
      type: newMenu.type || MenuType.ROUTE,
      status: newMenu.status || BasicStatus.ACTIVE,
      parent_id: newMenu.parent_id || null,
      sort_order: newMenu.sort_order || 0,
      is_public: newMenu.is_public || false,
      show_in_menu: newMenu.show_in_menu !== false,
      required_permission_id: newMenu.required_permission_id || null
    }
  } else {
    resetForm()
  }
}, { immediate: true })

// Reset form
function resetForm() {
  formData.value = {
    code: '',
    name: '',
    path: null,
    api_path: null,
    icon: null,
    type: MenuType.ROUTE,
    status: BasicStatus.ACTIVE,
    parent_id: null,
    sort_order: 0,
    is_public: false,
    show_in_menu: true,
    required_permission_id: null
  }
  validationErrors.value = {}
}

// Validate form
function validate() {
  validationErrors.value = {}
  
  if (!formData.value.code || formData.value.code.trim().length < 3) {
    validationErrors.value.code = 'Code phải có ít nhất 3 ký tự'
  } else if (formData.value.code.length > 120) {
    validationErrors.value.code = 'Code không được vượt quá 120 ký tự'
  }
  
  if (!formData.value.name || formData.value.name.trim().length === 0) {
    validationErrors.value.name = 'Tên menu là bắt buộc'
  } else if (formData.value.name.length > 150) {
    validationErrors.value.name = 'Tên menu không được vượt quá 150 ký tự'
  }
  
  if (formData.value.path && formData.value.path.length > 255) {
    validationErrors.value.path = 'Path không được vượt quá 255 ký tự'
  }
  
  if (formData.value.api_path && formData.value.api_path.length > 255) {
    validationErrors.value.api_path = 'API Path không được vượt quá 255 ký tự'
  }
  
  if (formData.value.icon && formData.value.icon.length > 120) {
    validationErrors.value.icon = 'Icon không được vượt quá 120 ký tự'
  }
  
  return Object.keys(validationErrors.value).length === 0
}

// Submit form
async function validateAndSubmit() {
  if (!validate()) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    const submitData = {
      ...formData.value,
      // Convert empty strings to null
      path: formData.value.path || null,
      api_path: formData.value.api_path || null,
      icon: formData.value.icon || null,
      parent_id: formData.value.parent_id || null,
      required_permission_id: formData.value.required_permission_id || null
    }
    
    if (isEdit.value) {
      emit('updated', submitData)
    } else {
      emit('created', submitData)
    }
  } catch (error) {
  } finally {
    isSubmitting.value = false
  }
}

function handleClose() {
  resetForm()
  emit('close')
}
</script>




