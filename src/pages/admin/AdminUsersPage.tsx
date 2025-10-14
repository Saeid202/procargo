import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  UserService,
  UserWithId,
  UserFilters,
} from "../../services/userService";
import { RolesEnum } from "../../abstractions/enums/roles.enum";
import { toast } from "react-hot-toast";
import {
  UserIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  EyeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

const AdminUsersPage: React.FC = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserWithId | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [filters, setFilters] = useState<UserFilters>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersByRole: {} as Record<RolesEnum, number>,
  });

  const loadUsers = async () => {
    setLoading(true);
    const { users: data, error } = await UserService.getUsers(filters);
    if (error) {
      toast.error(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };
  const loadStats = async () => {
    const { totalUsers, usersByRole, error } = await UserService.getUserStats();
    if (error) {
      toast.error(error);
    } else {
      setStats({ totalUsers, usersByRole });
    }
  };
  useEffect(() => {
    loadUsers();
    loadStats();
  }, [loadUsers, loadStats]);

  useEffect(() => {
    loadUsers();
  }, [filters, loadUsers]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: RolesEnum | "") => {
    setFilters((prev) => ({ ...prev, role: (role as RolesEnum) || undefined }));
    setCurrentPage(1);
  };

  const handleViewUser = (user: UserWithId) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setShowUserModal(false);
  };

  const handleUpdateRole = async (userId: string, newRole: RolesEnum) => {
    const { error } = await UserService.updateUserRole(userId, newRole);
    if (error) {
      toast.error(error);
    } else {
      toast.success(t("user_role_updated_successfully"));
      loadUsers();
      loadStats();
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t("confirm_delete_user"))) {
      const { error } = await UserService.deleteUser(userId);
      if (error) {
        toast.error(error);
      } else {
        toast.success(t("user_deleted_successfully"));
        loadUsers();
        loadStats();
      }
    }
  };

  // Pagination
  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = users.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const getRoleBadgeColor = (role: RolesEnum) => {
    switch (role) {
      case RolesEnum.ADMIN:
        return "bg-red-100 text-red-800";
      case RolesEnum.AGENT:
        return "bg-blue-100 text-blue-800";
      case RolesEnum.LAWYER:
        return "bg-purple-100 text-purple-800";
      case RolesEnum.USER:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleDisplayName = (role: RolesEnum) => {
    switch (role) {
      case RolesEnum.ADMIN:
        return t("admin");
      case RolesEnum.AGENT:
        return t("agent");
      case RolesEnum.LAWYER:
        return t("lawyer");
      case RolesEnum.USER:
        return t("user");
      default:
        return role;
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {t("admin_users")}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {t("admin_users_description")}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {t("total_users")}:{" "}
                <span className="font-medium">{stats.totalUsers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {Object.entries(stats.usersByRole).map(([role, count]) => (
          <div key={role} className="bg-white shadow rounded-lg p-3 sm:p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                  {getRoleDisplayName(role as RolesEnum)}
                </p>
                <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                  {count}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-3 sm:gap-4">
            {/* Search */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("search")}
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder={t("search_by_name_email_company")}
                  className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("filter_by_role")}
              </label>
              <select
                value={filters.role || ""}
                onChange={(e) => handleRoleFilter(e.target.value as RolesEnum)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t("all_roles")}</option>
                <option value={RolesEnum.ADMIN}>{t("admin")}</option>
                <option value={RolesEnum.AGENT}>{t("agent")}</option>
                <option value={RolesEnum.LAWYER}>{t("lawyer")}</option>
                <option value={RolesEnum.USER}>{t("user")}</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end sm:col-span-1">
              <button
                onClick={() => {
                  setFilters({});
                  setSearchTerm("");
                }}
                className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm sm:text-base"
              >
                {t("clear_filters")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-3 py-4 sm:px-4 sm:py-5 lg:px-6">
          {users.length === 0 ? (
            <div className="text-center py-12">
              <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {t("no_users_found")}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {t("no_users_found_description")}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("user")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("email")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("company")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("role")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("created")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paginatedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <UserIcon className="h-6 w-6 text-gray-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.first_name} {user.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user.phone || t("no_phone")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {user.company_name || t("no_company")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {getRoleDisplayName(user.role)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : t("unknown")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewUser(user)}
                              className="text-blue-600 hover:text-blue-900"
                              title={t("view_user")}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </button>
                            <select
                              value={user.role}
                              onChange={(e) =>
                                handleUpdateRole(
                                  user.id,
                                  e.target.value as RolesEnum
                                )
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1"
                            >
                              <option value={RolesEnum.USER}>
                                {t("user")}
                              </option>
                              <option value={RolesEnum.AGENT}>
                                {t("agent")}
                              </option>
                              <option value={RolesEnum.LAWYER}>
                                {t("lawyer")}
                              </option>
                              <option value={RolesEnum.ADMIN}>
                                {t("admin")}
                              </option>
                            </select>
                            <button
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600 hover:text-red-900"
                              title={t("delete_user")}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {paginatedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 rounded-lg p-4 bg-white hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-medium text-gray-900 truncate">
                              {user.first_name} {user.last_name}
                            </h3>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                                user.role
                              )}`}
                            >
                              {getRoleDisplayName(user.role)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate mt-1">
                            {user.email}
                          </p>
                          {user.company_name && (
                            <p className="text-xs text-gray-400 truncate mt-1">
                              {user.company_name}
                            </p>
                          )}
                          {user.phone && (
                            <p className="text-xs text-gray-400 truncate">
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 ml-2">
                        <button
                          onClick={() => handleViewUser(user)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title={t("view_user")}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title={t("delete_user")}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="text-xs text-gray-500">
                          {t("created")}:{" "}
                          {user.created_at
                            ? new Date(user.created_at).toLocaleDateString()
                            : t("unknown")}
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-500">
                            {t("role")}:
                          </label>
                          <select
                            value={user.role}
                            onChange={(e) =>
                              handleUpdateRole(
                                user.id,
                                e.target.value as RolesEnum
                              )
                            }
                            className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                          >
                            <option value={RolesEnum.USER}>{t("user")}</option>
                            <option value={RolesEnum.AGENT}>
                              {t("agent")}
                            </option>
                            <option value={RolesEnum.LAWYER}>
                              {t("lawyer")}
                            </option>
                            <option value={RolesEnum.ADMIN}>
                              {t("admin")}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-3 py-3 sm:px-4 lg:px-6 border-t border-gray-200">
                  {/* Mobile Pagination */}
                  <div className="flex flex-col space-y-3 sm:hidden">
                    <div className="text-center">
                      <p className="text-sm text-gray-700">
                        {t("showing")}{" "}
                        <span className="font-medium">{startIndex + 1}</span>{" "}
                        {t("to")}{" "}
                        <span className="font-medium">
                          {Math.min(endIndex, users.length)}
                        </span>{" "}
                        {t("of")}{" "}
                        <span className="font-medium">{users.length}</span>{" "}
                        {t("results")}
                      </p>
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={handlePrevious}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="h-4 w-4 mr-1" />
                        {t("previous")}
                      </button>
                      <div className="flex items-center space-x-1">
                        <span className="text-sm text-gray-500">
                          {t("page")} {currentPage} {t("of")} {totalPages}
                        </span>
                      </div>
                      <button
                        onClick={handleNext}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t("next")}
                        <ChevronRightIcon className="h-4 w-4 ml-1" />
                      </button>
                    </div>
                  </div>

                  {/* Desktop Pagination */}
                  <div className="hidden sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        {t("showing")}{" "}
                        <span className="font-medium">{startIndex + 1}</span>{" "}
                        {t("to")}{" "}
                        <span className="font-medium">
                          {Math.min(endIndex, users.length)}
                        </span>{" "}
                        {t("of")}{" "}
                        <span className="font-medium">{users.length}</span>{" "}
                        {t("results")}
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={handlePrevious}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              currentPage === i + 1
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        <button
                          onClick={handleNext}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50  h-full w-full z-50 !m-0">
          <div className="relative top-4 sm:top-20 p-4 sm:p-5 border w-full max-w-sm sm:max-w-md lg:max-w-lg shadow-lg rounded-md bg-white m-4 sm:m-0 !mx-auto">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {t("user_details")}
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <span className="sr-only">{t("close")}</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="space-y-4 max-h-96 sm:max-h-none overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("name")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900 break-words">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("email")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900 break-all">
                    {selectedUser.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("phone")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedUser.phone || t("no_phone")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("company")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900 break-words">
                    {selectedUser.company_name || t("no_company")}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("role")}
                  </label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                        selectedUser.role
                      )}`}
                    >
                      {getRoleDisplayName(selectedUser.role)}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {t("created_at")}
                  </label>
                  <p className="mt-1 text-sm text-gray-900 break-words">
                    {selectedUser.created_at
                      ? new Date(selectedUser.created_at).toLocaleString()
                      : t("unknown")}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseModal}
                  className="w-full sm:w-auto bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 text-sm sm:text-base"
                >
                  {t("close")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
