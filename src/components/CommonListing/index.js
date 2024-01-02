"use client";

import { useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import Notification from "../Notification/Notification";
import { searchProducts } from "@/services/product";
import ProductTile from "./ProductTile";
import Pagination from "./Pagination";

export default function CommonListing({ data }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [noResultsFound, setNoResultsFound] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [total, setTotal] = useState(0); // State for total products in this pagination page
  const [showDiscountedProducts, setShowDiscountedProducts] = useState(false);
  const [discountedProductCount, setDiscountedProductCount] = useState(0); // State for the count of discounted products

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 10;

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    const response = await searchProducts();
    if (response.success) {
      setSearchResults(response.data);
      updateDiscountedProductCount(response.data); // Update discounted product count
    }
  };

  const updateDiscountedProductCount = (products) => {
    const discountedCount = products.filter(
      (product) => product.priceDrop > 0
    ).length;
    setDiscountedProductCount(discountedCount);
  };

  const handleSearch = async () => {
    const response = await searchProducts();
    if (response.success) {
      const products = response.data;

      if (searchQuery === "") {
        setSearchResults(products);
        setNoResultsFound(false);
        updateDiscountedProductCount(products); // Update discounted product count
      } else {
        const filteredProducts = products.filter((product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

        setSearchResults(filteredProducts);
        setNoResultsFound(filteredProducts.length === 0);
        updateDiscountedProductCount(filteredProducts); // Update discounted product count
      }
      setCurrentPage(1); // Reset to the first page when performing a search
    }
  };

  const router = useRouter();

  useEffect(() => {
    router.refresh();
  }, []);

  // This useEffect monitors changes in the searchQuery state
  useEffect(() => {
    if (searchQuery === "") {
      fetchAllProducts(); // Fetch all products when searchQuery is empty
    }
  }, [searchQuery]);

  const handleShowDiscountedProducts = () => {
    if (showDiscountedProducts) {
      // If already showing discounted products, fetch all products again
      fetchAllProducts();
    } else {
      // Filter products with priceDrop > 0 if not already showing discounted products
      const discountedProducts = searchResults.filter(
        (product) => product.priceDrop > 0
      );
      setShowDiscountedProducts(true);
      setSearchResults(discountedProducts);
    }

    // Toggle the showDiscountedProducts state
    setShowDiscountedProducts(!showDiscountedProducts);
  };

  const handleRefresh = () => {
    fetchAllProducts(); // Fetch all products and refresh the list
  };

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;

  let filteredProducts =
    selectedFilter === "lowToHigh"
      ? searchResults?.slice().sort((a, b) => a.price - b.price)
      : selectedFilter === "highToLow"
      ? searchResults?.slice().sort((a, b) => b.price - a.price)
      : searchResults;

  const productsToInclude = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  if (indexOfFirstProduct >= filteredProducts.length) {
    const productsToAdd = filteredProducts?.slice(0, productsPerPage);
    productsToInclude.push(...productsToAdd);
  }
  useEffect(() => {
    setTotal(productsToInclude.length);
  }, [productsToInclude]);

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage <= Math.ceil(filteredProducts.length / productsPerPage)) {
      setCurrentPage(nextPage);
    }
  };

  const handlePreviousPage = () => {
    const previousPage = currentPage - 1;
    if (previousPage >= 1) {
      setCurrentPage(previousPage);
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <section className="py-12 sm:py-16 mt-[60px]">
      <section className="w-[80%] px-7 m-auto py-10 flex-row-reverse mb-10 mt-5 rounded-lg  flex justify-between bg-[#f6f3fc]">
        <div className="flex  rounded-lg">
          <fieldset className="w-full space-y-1  dark:text-gray-100">
            <div className="relative  flex items-center rounded-lg ">
              <span className="absolute inset-y-0 left-0 flex items-center pl-2">
                <button
                  type="button"
                  title="search"
                  className="p-1 focus:outline-none focus:ring"
                >
                  <svg
                    fill="currentColor"
                    viewBox="0 0 512 512"
                    className="w-4 h-4 text-black"
                  >
                    <path d="M479.6,399.716l-81.084-81.084-62.368-25.767A175.014,175.014,0,0,0,368,192c0-97.047-78.953-176-176-176S16,94.953,16,192,94.953,368,192,368a175.034,175.034,0,0,0,101.619-32.377l25.7,62.2L400.4,478.911a56,56,0,1,0,79.2-79.195ZM48,192c0-79.4,64.6-144,144-144s144,64.6,144,144S271.4,336,192,336,48,271.4,48,192ZM456.971,456.284a24.028,24.028,0,0,1-33.942,0l-76.572-76.572-23.894-57.835L380.4,345.771l76.573,76.572A24.028,24.028,0,0,1,456.971,456.284Z"></path>
                  </svg>
                </button>
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleInputKeyPress}
                placeholder="Search..."
                className=" py-[10px] pl-10 px-24 text-sm rounded-lg !rounded-e-none sm:w-auto focus:outline-none bg-white text-black focus:dark:border-sky-400"
              />
              <button
                className="  bg-blue-400 py-[8px] px-3 rounded-lg !rounded-s-none"
                onClick={handleSearch}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                  />
                </svg>
              </button>
            </div>
          </fieldset>
        </div>

        <select
          className="select select-bordered w-full max-w-xs bg-white  "
          value={selectedFilter}
          onChange={(e) => setSelectedFilter(e.target.value)}
        >
          <option value="all">All Products</option>
          <option value="lowToHigh">Low to High Price</option>
          <option value="highToLow">High to Low Price</option>
        </select>
      </section>

      <div className="flex justify-between items-center w-[80%] m-auto mb-10 flex-row-reverse">
        <button
          onClick={handleShowDiscountedProducts}
          className={`px-4 py-2 w-[200px] text-white rounded-lg ${
            showDiscountedProducts ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {showDiscountedProducts ? "All Products" : "Discounted Products"}
        </button>
        <p className="text-xl font-bold">
          Discounted : {discountedProductCount}
        </p>
      </div>

      <div className="m-auto pt-6 pb-12 bg-white shadow-sm w-[80%] px-4 sm:px-6 lg:px-8">
        <div className="mt-10 grid sm:gap-4 lg:mt-16 border-t pt-6">
          <div>
            {productsToInclude.length ? (
              productsToInclude.map((item) => (
                <ProductTile
                  key={item._id}
                  item={item}
                  handleRefresh={fetchAllProducts}
                />
              ))
            ) : noResultsFound ? (
              <section className="flex items-center sm:p-1">
                <div className="container flex flex-col items-center justify-center px-5 mx-auto my-8 space-y-8 text-center sm:max-w-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 512 512"
                    className="w-40 h-40 dark:text-gray-600"
                  >
                    <path
                      fill="currentColor"
                      d="M256,16C123.452,16,16,123.452,16,256S123.452,496,256,496,496,388.548,496,256,388.548,16,256,16ZM403.078,403.078a207.253,207.253,0,1,1,44.589-66.125A207.332,207.332,0,0,1,403.078,403.078Z"
                    ></path>
                    <rect
                      width="176"
                      height="32"
                      x="168"
                      y="320"
                      fill="currentColor"
                    ></rect>
                    <polygon
                      fill="currentColor"
                      points="210.63 228.042 186.588 206.671 207.958 182.63 184.042 161.37 162.671 185.412 138.63 164.042 117.37 187.958 141.412 209.329 120.042 233.37 143.958 254.63 165.329 230.588 189.37 251.958 210.63 228.042"
                    ></polygon>
                    <polygon
                      fill="currentColor"
                      points="383.958 182.63 360.042 161.37 338.671 185.412 314.63 164.042 293.37 187.958 317.412 209.329 296.042 233.37 319.958 254.63 341.329 230.588 365.37 251.958 386.63 228.042 362.588 206.671 383.958 182.63"
                    ></polygon>
                  </svg>
                  <p className="text-3xl">
                    Looks like our services are currently offline
                  </p>
                  <button
                    onClick={handleRefresh}
                    rel="noopener noreferrer"
                    href="#"
                    className="px-8 py-3 font-semibold rounded dark:bg-sky-400 dark:text-gray-900"
                  >
                    Refresh This Page
                  </button>
                </div>
              </section>
            ) : null}
          </div>
        </div>
        <div className="flex justify-center mt-20 gap-4 items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L5.25 12l7.5-7.5"
            />
          </svg>

          <button
            onClick={handlePreviousPage}
            className="px-2 py-1 rounded-md  hover:bg-slate-200 ease-in duration-300 "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          {searchResults.length > productsPerPage && (
            <Pagination
              productsPerPage={productsPerPage}
              totalProducts={searchResults.length}
              currentPage={currentPage}
              paginate={paginate}
            />
          )}
          <button
            onClick={handleNextPage}
            className="px-2 py-1 rounded-md  hover:bg-slate-200 ease-in duration-300 "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-4 h-4 text-slate-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.25 4.5l7.5 7.5-7.5 7.5m-6-15l7.5 7.5-7.5 7.5"
            />
          </svg>
        </div>
      </div>
      <Notification></Notification>
    </section>
  );
}
