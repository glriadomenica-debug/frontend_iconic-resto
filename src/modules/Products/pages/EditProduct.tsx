import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { AiFillEdit } from "react-icons/ai";

interface Category {
  id: number;
  category_name: string;
}

interface EditProduct {
  id: number;
  category_id: number;
  product_name: string;
  price: number;
  stock: number;
  image: string;
}

export default function EditProduct() {
  const id = useParams().id;
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [_editProduct, setEditProduct] = useState<EditProduct>({
    id: 0,
    category_id: 0,
    product_name: "",
    price: 0,
    stock: 0,
    image: "",
  });
  const [formEditProduct, setFormEditProduct] = useState<any>({});

  const handleChange = (event: any) => {
    setFormEditProduct({
      ...formEditProduct,
      [event.target.name]: event.target.value,
    });
  };

  //untuk ambil semua data yang ada di DB Product
  const fetchProduct = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "http://192.168.101.4:8000/api/products/" + id,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      console.log(response, "response");

      await setEditProduct(response.data.data);
      await setFormEditProduct(response.data.data);
    } catch (error) {
      console.log(error, "error");
    }
  };
  const fetchCategory = async () => {
    try {
      const response = await axios({
        method: "GET",
        url: "http://192.168.101.4:8000/api/categories",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      setCategories(response.data.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCategory();
    fetchProduct();
  }, [id]);

  const handleSubmitUpdate = async () => {
    try {
      const response = await axios({
        method: "PUT",
        url: "http://192.168.101.4:8000/api/products/" + id,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        data: formEditProduct,
      });
      console.log(response, "response");
      navigate("/products");
    } catch (error) {
      console.log(error, "error");
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl px-4 py-4 opacity-80">
        <div className="flex items-center text-xl text-blue-900 font-bold">
          <AiFillEdit />
          Edit Product
        </div>

        <div className="py-4 text-1xl">
          <label htmlFor="category_id" className="text-blue-900">
            Food Category
          </label>
          <select
            name="category_id"
            className="w-full border border-gray-400 my-2 p-2 rounded"
            onChange={handleChange}
            value={formEditProduct.category_id || ""}
          >
            <option value="">-- Select Food Category --</option>

            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          <label htmlFor="product_name" className="text-blue-900">
            Product
          </label>
          <input
            type="text"
            name="product_name"
            className="w-full border border-gray-400 my-2 p-2 rounded"
            onChange={handleChange}
            value={formEditProduct.product_name || ""}
          />
        </div>

        <label htmlFor="price" className="text-blue-900">
          Price
        </label>
        <input
          type="number"
          name="price"
          className="w-full border border-gray-400 my-2 p-2 rounded"
          onChange={handleChange}
          value={formEditProduct.price || ""}
        />
        <label htmlFor="stock" className="text-blue-900">
          Stock
        </label>
        <input
          type="number"
          name="stock"
          className="w-full border border-gray-400 my-2 p-2 rounded"
          onChange={handleChange}
          value={formEditProduct.stock || ""}
        />

        <label htmlFor="image" className="text-blue-900">
          Image
        </label>
        <input
          type="text"
          name="image"
          className="w-full border border-gray-400 my-2 p-2 rounded"
          onChange={handleChange}
          value={formEditProduct.image || ""}
        />

        <div className="my-4">
          <button
            className="bg-blue-900 opacity-80 hover:bg-blue-800 cursor-pointer text-white py-2 px-4 rounded"
            onClick={handleSubmitUpdate}
          >
            Update
          </button>
        </div>
      </div>
    </>
  );
}
