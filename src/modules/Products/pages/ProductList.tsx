// import { useEffect, useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { AiTwotoneEdit } from "react-icons/ai";
// import { AiFillDelete } from "react-icons/ai";
// import Modal from "../../../components/modals/Product/ProdModal";
// import ProductModalConfirmation from "../../../components/modals/Product/ProdModalConfirmation";

// interface Category {
//   id: number;
//   category_name: string;
// }

// interface Product {
//   id: number;
//   category_id: number;
//   category?: Category;
//   product_name: string;
//   price: number;
//   stock: number;
//   image: string;
// }

// export default function ListProduct() {
//   const [product, setProduct] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [openModal, setOpenModal] = useState(false);
//   const [openModalDelete, setOpenModalDelete] = useState(false);
//   const [currentPage, setCurrentPage] = useState<number>(1);
//   const [lastPage, setLastPage] = useState<number>(1);
//   const [formProduct, setFormProduct] = useState({
//     category_id: 0,
//     product_name: "",
//     price: 0,
//     stock: 0,
//     image: "",
//   });
//   const [selectedId, setSelectedId] = useState<number | null>(null);
//   const [Categories, setCategories] = useState<Category[]>([]);
//   // const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
//   const navigate = useNavigate();

//   const fetchProduct = async () => {
//     try {
//       const res = await axios({
//         method: "GET",
//         url: `http://localhost:8000/api/products?page=${currentPage}`,
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       setProduct(res.data.data.data || []);
//       setLastPage(res.data.data.last_page);
//     } catch (err) {
//       console.log(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCategory = async () => {
//     try {
//       const response = await axios({
//         method: "GET",
//         url: "http://localhost:8000/api/categories",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       setCategories(response.data.data.data || []);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetchProduct();
//     fetchCategory();
//   }, [currentPage]);

//   const handleChangeProduct = (e: any) => {
//     setFormProduct({
//       ...formProduct,
//       [e.target.name]: e.target.value,
//     });
//   };

//   const handleSubmitProduct = async () => {
//     try {
//       await axios({
//         method: "POST",
//         url: "http://localhost:8000/api/products",
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//         data: formProduct,
//       });
//       fetchProduct();
//       setOpenModal(false);
//       // setFormProduct();
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   const handleDeleteProd = async () => {
//     try {
//       await axios({
//         method: "DELETE",
//         url: `http://localhost:8000/api/products/${selectedId}`,
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });
//       fetchProduct();
//       setOpenModalDelete(false);
//     } catch (error: any) {
//       alert(error.response.data.data);
//     }
//   };

//   // Filter Categorry
//   // const handleCategoryClick = (id: number) => {
//   //   setSelectedCategory(id);
//   //   fetchProduct();
//   // };

//   return (
//     <>
//       <div className="bg-white rounded-2xl shadow-md p-6">
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-2xl font-bold text-gray-800">Product List</h1>
//             <p className="text-sm text-gray-500">Manage restaurant product</p>
//           </div>

//           <button
//             onClick={() => setOpenModal(true)}
//             className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl transition"
//           >
//             + Add Product
//           </button>
//         </div>
//         <div className="overflow-x-auto">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-orange-100 text-gray-700">
//                 <th className="text-left px-4 py-3 rounded-l-xl">No</th>
//                 <th className="text-left px-4 py-3">Food Category</th>
//                 <th className="text-left px-4 py-3">Product</th>
//                 <th className="text-left px-4 py-3">Price</th>
//                 <th className="text-left px-4 py-3">Stock</th>
//                 <th className="text-left px-4 py-3">Image</th>
//                 <th className="text-center px-4 py-3 rounded-r-xl">Action</th>
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={7} className="text-center py-6 text-gray-500">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : product.length > 0 ? (
//                 product.map((product, index) => (
//                   <tr
//                     key={product.id}
//                     className="border-b border-gray-100 hover:bg-orange-50 transition"
//                   >
//                     <td className="px-4 py-4">{index + 1}</td>

//                     <td className="px-4 py-4 font-medium text-gray-700">
//                       {product.category?.category_name}
//                     </td>
//                     <td className="px-4 py-4 font-medium text-gray-700">
//                       {product.product_name}
//                     </td>
//                     <td className="px-4 py-4 font-medium text-gray-700">
//                       Rp. {(product.price * 1000).toLocaleString("id-ID")}
//                     </td>
//                     <td className="px-4 py-4 font-medium text-gray-700">
//                       {product.stock}
//                     </td>
//                     <td className="px-4 py-4 font-medium text-gray-700">
//                       {product.image}
//                     </td>

//                     <td className="px-4 py-4">
//                       <div className="flex items-center justify-center gap-3">
//                         <button
//                           className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
//                           onClick={() =>
//                             navigate(`/products/edit/${product.id}`)
//                           }
//                         >
//                           <AiTwotoneEdit />
//                         </button>

//                         <button
//                           className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition cursor-pointer"
//                           onClick={() => {
//                             setSelectedId(product.id);
//                             setOpenModalDelete(true);
//                           }}
//                         >
//                           <AiFillDelete />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               ) : (
//                 <tr>
//                   <td colSpan={7} className="text-center py-6 text-gray-500">
//                     No product found
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//         <div className="flex items-center justify-end gap-3 mt-6">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage(currentPage - 1)}
//             className={`px-4 py-2 rounded-lg text-white transition ${currentPage === 1 ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500 hover:bg-orange-600"}`}
//           >
//             Prev
//           </button>
//           <span className="font-medium text-gray-700">
//             Page {currentPage} of {lastPage}
//           </span>
//           <button
//             disabled={currentPage === lastPage}
//             onClick={() => setCurrentPage(currentPage + 1)}
//             className={`px-4 py-2 rounded-lg text-white transition ${
//               currentPage === lastPage
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-orange-500 hover:bg-orange-600"
//             }`}
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* MODAL */}
//       <Modal
//         openModal={openModal}
//         setOpenModal={setOpenModal}
//         handleChange={handleChangeProduct}
//         handleSubmit={handleSubmitProduct}
//         categories={Categories}
//         title="Add new product"
//       />
//       <ProductModalConfirmation
//         openModal={openModalDelete}
//         setOpenModal={setOpenModalDelete}
//         title="Delete Product"
//         description="Are you sure you want to delete this product?"
//         handleSubmit={handleDeleteProd}
//       />
//     </>
//   );
// }
