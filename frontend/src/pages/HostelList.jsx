import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHostels } from "../app/slices/hostelSlice";
import HostelCard from "../components/hostel/HostelCard";
import HostelFilter from "../components/hostel/HostelFilter";
import Loader from "../components/common/Loader";
import Footer from "../components/common/Footer";
const HostelList = () => {
  const dispatch = useDispatch();
  const { hostels, isLoading, pagination } = useSelector(
    (state) => state.hostel,
  );

  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchHostels({ ...filters, page: currentPage }));
  }, [dispatch, filters, currentPage]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading && !hostels.length) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Your Perfect Hostel
          </h1>
          <p className="text-gray-600">
            Discover comfortable and affordable hostels across India
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="sticky top-4">
              <HostelFilter
                onFilterChange={handleFilterChange}
                loading={isLoading}
              />
            </div>
          </div>

          {/* Hostels Grid */}
          <div className="lg:w-3/4">
            {isLoading && (
              <div className="flex justify-center py-8">
                <Loader />
              </div>
            )}

            {!isLoading && hostels.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No hostels found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your filters to see more results
                </p>
              </div>
            )}

            {hostels.length > 0 && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <p className="text-gray-600">
                    Showing {hostels.length} of {pagination?.totalRecords || 0}{" "}
                    hostels
                  </p>
                  <select className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="createdAt">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {hostels.map((hostel) => (
                    <HostelCard key={hostel._id} hostel={hostel} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.total > 1 && (
                  <div className="flex justify-center mt-8">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Previous
                      </button>

                      {Array.from(
                        { length: Math.min(5, pagination.total) },
                        (_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-2 border rounded-md ${
                                currentPage === page
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        },
                      )}

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.total}
                        className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default HostelList;
