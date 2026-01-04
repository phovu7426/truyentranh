<template>
  <Modal
    v-model="modalVisible"
    :title="formTitle"
    :loading="loading"
    size="xl"
  >
    <div class="space-y-8">
      <!-- Thông tin cơ bản -->
      <section class="space-y-4">
        <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </span>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">Thông tin cơ bản</h3>
            <p class="text-sm text-gray-500">Nhập thông tin đăng nhập và trạng thái</p>
          </div>
        </header>

        <FormWrapper
          :default-values="defaultValues"
          :rules="validationRules"
          :api-errors="apiErrors"
          :submit-text="user ? 'Cập nhật' : 'Thêm mới'"
          @submit="handleSubmit"
          @cancel="onClose"
        >
          <template #default="{ form, errors, clearError }">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                v-model="form.username"
                label="Tên đăng nhập"
                name="username"
                :error="errors.username"
                autocomplete="username"
                @update:model-value="clearError('username')"
              />
              <FormField
                v-model="form.email"
                label="Email"
                name="email"
                type="email"
                :error="errors.email"
                autocomplete="email"
                @update:model-value="clearError('email')"
              />
              <FormField
                v-model="form.phone"
                label="Số điện thoại"
                name="phone"
                type="tel"
                :error="errors.phone"
                autocomplete="tel"
                @update:model-value="clearError('phone')"
              />
              <FormField
                v-if="!user"
                v-model="form.password"
                label="Mật khẩu"
                name="password"
                type="password"
                :error="errors.password"
                required
                autocomplete="new-password"
                @update:model-value="clearError('password')"
              />
              <SingleSelectEnhanced
                v-model="form.status"
                label="Trạng thái"
                :options="statusOptions"
                label-field="label"
                value-field="value"
                placeholder="-- Chọn trạng thái --"
                :error="errors.status"
                required="required"
                @update:model-value="clearError('status')"
              />
            </div>

            <!-- Thông tin hồ sơ -->
            <div class="mt-8 space-y-4">
              <header class="border-b border-gray-200 pb-3 flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                </span>
                <div>
                  <h3 class="text-lg font-semibold text-gray-900">Hồ sơ người dùng</h3>
                  <p class="text-sm text-gray-500">Thông tin hiển thị và liên hệ</p>
                </div>
              </header>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  v-model="form.name"
                  label="Họ tên"
                  name="name"
                  :error="errors.name"
                  autocomplete="name"
                  @update:model-value="clearError('name')"
                />
                <SingleSelectEnhanced
                  v-model="form.gender"
                  label="Giới tính"
                  :options="genderOptions"
                  label-field="label"
                  value-field="value"
                  placeholder="-- Chọn giới tính --"
                  :error="errors.gender"
                  @update:model-value="clearError('gender')"
                />
                <FormField
                  v-model="form.birthday"
                  label="Ngày sinh"
                  name="birthday"
                  type="date"
                  :error="errors.birthday"
                  @update:model-value="clearError('birthday')"
                />
                <FormField
                  v-model="form.address"
                  label="Địa chỉ"
                  name="address"
                  :error="errors.address"
                  autocomplete="street-address"
                  @update:model-value="clearError('address')"
                />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <label class="block text-sm font-medium text-gray-700" for="user-image">Ảnh đại diện</label>
                  <ImageUploader
                    v-model="form.image"
                    :default-url="imageUrl"
                    @remove="form.remove_image = true"
                  />
                </div>
                <FormField
                  v-model="form.about"
                  label="Giới thiệu"
                  name="about"
                  type="textarea"
                  :error="errors.about"
                  autocomplete="off"
                  @update:model-value="clearError('about')"
                />
              </div>
            </div>
          </template>
        </FormWrapper>
      </section>
    </div>
  </Modal>
</template>

<script setup>
import { computed } from 'vue'
import Modal from '@/components/Core/Modal/Modal.vue'
import FormWrapper from '@/components/Core/Form/FormWrapper.vue'
import FormField from '@/components/Core/Form/FormField.vue'
import ImageUploader from '@/components/Core/Image/ImageUploader.vue'
import SingleSelectEnhanced from '@/components/Core/Select/SingleSelectEnhanced.vue'
import { useFormDefaults } from '@/utils/form'

const props = defineProps({
  show: Boolean,
  user: Object,
  statusEnums: {
    type: Array,
    default: () => []
  },
  genderEnums: {
    type: Array,
    default: () => []
  },
  
  apiErrors: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

const formTitle = computed(() => props.user ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới')
const modalVisible = computed({
  get: () => props.show,
  set: () => onClose()
})

const defaultValues = computed(() => {
  const obj = props.user || {}
  
  return {
    username: '',
    email: '',
    phone: '',
    password: '',
    name: '',
    gender: '',
    birthday: '',
    address: '',
    image: null,
    about: '',
    status: '',
    remove_image: false,
    ...obj
  }
})

const imageUrl = computed(() => props.user?.image || null)

const validationRules = computed(() => ({
  username: [
    { max: [50, 'Tên đăng nhập không được vượt quá 50 ký tự.'] }
  ],
  email: [
    { email: 'Email không hợp lệ.' }
  ],
  phone: [
    { max: [20, 'Số điện thoại không được vượt quá 20 ký tự.'] }
  ],
  password: props.user ? [] : [
    { required: 'Mật khẩu là bắt buộc.' },
    { min: [6, 'Mật khẩu phải có ít nhất 6 ký tự.'] }
  ],
  name: [
    { max: [255, 'Họ tên không được vượt quá 255 ký tự.'] }
  ],
  address: [
    { max: [255, 'Địa chỉ không được vượt quá 255 ký tự.'] }
  ],
  about: [
    { max: [500, 'Giới thiệu không được vượt quá 500 ký tự.'] }
  ]
}))

const statusOptions = computed(() =>
  Array.isArray(props.statusEnums)
    ? props.statusEnums
        .filter(opt => opt != null)
        .map(opt => ({
          value: opt?.value ?? opt?.id ?? '',
          label: opt?.label ?? opt?.name ?? ''
        }))
    : []
)

const genderOptions = computed(() =>
  Array.isArray(props.genderEnums)
    ? props.genderEnums
        .filter(opt => opt != null)
        .map(opt => ({
          value: opt?.value ?? opt?.id ?? '',
          label: opt?.label ?? opt?.name ?? ''
        }))
    : []
)

 

function handleSubmit(form) {
  emit('submit', form)
}

function onClose() {
  emit('cancel')
}
</script>

<style scoped>
/* Đồng bộ header/modal tone với modal sản phẩm admin */
:deep(.modal-container) {
  @apply bg-gradient-to-br from-white to-gray-50;
}

:deep(.modal-header) {
  @apply bg-gradient-to-r from-blue-600 to-blue-700 text-white border-b-0;
}

:deep(.modal-title) {
  @apply text-xl font-bold text-white;
}

:deep(.modal-close) {
  @apply text-white hover:text-gray-200;
}
</style>