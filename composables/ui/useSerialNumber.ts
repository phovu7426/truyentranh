/**
 * Composable để tính toán số thứ tự cho bảng dữ liệu
 * @param pagination - Đối tượng phân trang chứa current_page/page và per_page/limit
 * @returns Function - Hàm tính số thứ tự dựa trên index
 */
export function useSerialNumber(pagination: any) {
    /**
     * Tính số thứ tự dựa trên index trong mảng và thông tin phân trang
     * @param index - Index của item trong mảng hiện tại
     * @returns number - Số thứ tự tương ứng
     */
    const getSerialNumber = (index: number): number => {
        // Đảm bảo index là số hợp lệ
        const idx = typeof index === 'number' && !isNaN(index) ? index : 0
        
        // Hỗ trợ cả page/limit và current_page/per_page
        const pag = pagination?.value || pagination || {}
        const currentPage = Number(pag.page || pag.current_page || 1)
        const perPage = Number(pag.limit || pag.per_page || 10)
        
        // Đảm bảo tính toán nhất quán
        const page = Math.max(1, Math.floor(currentPage))
        const limit = Math.max(1, Math.floor(perPage))
        const idxNum = Math.max(0, Math.floor(idx))
        
        return (page - 1) * limit + idxNum + 1
    }

    return {
        getSerialNumber
    }
}