"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import {
  AlertCircle,
  Check,
  Edit2,
  FlaskConical,
  Loader2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  useAddCenterTest,
  useCenterTests,
  useGlobalTests,
  useRemoveCenterTest,
  useUpdateCenterTest,
} from "@/lib/hooks/useDiagnosticCenter";

import type {
  CenterTest,
  DiagnosticTest,
} from "@/lib/hooks/useDiagnosticCenter";

interface TestFormValues {
  testId: string;
  price: number;
  isAvailable: boolean;
}

export default function CenterTestsPage() {
  const t = useTranslations("DiagnosticCenter");

  const {
    data: globalTests = [],
    isLoading: isLoadingGlobal,
  } = useGlobalTests();

  const {
    data: centerTests = [],
    isLoading: isLoadingCenter,
    isFetching: isFetchingCenter,
  } = useCenterTests();

  const addTestMutation = useAddCenterTest();
  const updateTestMutation = useUpdateCenterTest();
  const removeTestMutation = useRemoveCenterTest();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTest, setEditingTest] =
    useState<CenterTest | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingTestId, setDeletingTestId] =
    useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TestFormValues>({
    defaultValues: {
      testId: "",
      price: 0,
      isAvailable: true,
    },
  });

  const isLoading =
    isLoadingGlobal || isLoadingCenter;

  const isSaving =
    addTestMutation.isPending ||
    updateTestMutation.isPending;

  /*
   * Tests which are available globally but have
   * not yet been added to this diagnostic center.
   */
 const availableGlobalTests = globalTests;

  /*
   * Search center tests safely.
   */
  const filteredCenterTests = useMemo(() => {
    const query = searchTerm
      .trim()
      .toLowerCase();

    if (!query) {
      return centerTests;
    }

    return centerTests.filter((test) => {
      const name =
        test.diagnosticTest?.name
          ?.toLowerCase() ?? "";

      return name.includes(query);
    });
  }, [centerTests, searchTerm]);

  /*
   * Open add modal.
   */
  const openAddModal = () => {
    setEditingTest(null);

    reset({
      testId: "",
      price: 0,
      isAvailable: true,
    });

    setIsModalOpen(true);
  };

  /*
   * Open edit modal.
   */
  const openEditModal = (test: CenterTest) => {
    setEditingTest(test);

    reset({
      testId: test.testId,
      price: Number(test.price) || 0,
      isAvailable: Boolean(test.isAvailable),
    });

    setIsModalOpen(true);
  };

  /*
   * Close modal.
   */
  const closeModal = () => {
    if (isSaving) {
      return;
    }

    setIsModalOpen(false);
    setEditingTest(null);

    reset({
      testId: "",
      price: 0,
      isAvailable: true,
    });
  };

  /*
   * Submit add / update form.
   */
  const onSubmit = async (
    data: TestFormValues,
  ) => {
    try {
      const price = Number(data.price);

      if (!Number.isFinite(price) || price < 0) {
        toast.error("Please enter a valid price.");
        return;
      }

      if (editingTest) {
        await updateTestMutation.mutateAsync({
          testId: editingTest.id,
          payload: {
            price,
            isAvailable: Boolean(
              data.isAvailable,
            ),
          },
        });

        toast.success(
          "Test updated successfully!",
        );
      } else {
        if (!data.testId) {
          toast.error("Please select a test.");
          return;
        }

        await addTestMutation.mutateAsync({
          testId: data.testId,
          price,
          isAvailable: Boolean(
            data.isAvailable,
          ),
        });

        toast.success(
          "Test added successfully!",
        );
      }

      closeModal();
    } catch (error: unknown) {
      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      const message =
        responseError?.response?.data?.message ||
        responseError?.message ||
        "Something went wrong!";

      toast.error(message);
    }
  };

  /*
   * Delete center test.
   */
  const handleDelete = async (
    testId: string,
  ) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this test?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingTestId(testId);

      await removeTestMutation.mutateAsync(
        testId,
      );

      toast.success(
        "Test removed successfully!",
      );
    } catch (error: unknown) {
      const responseError = error as {
        response?: {
          data?: {
            message?: string;
          };
        };
        message?: string;
      };

      toast.error(
        responseError?.response?.data?.message ||
          responseError?.message ||
          "Failed to remove test.",
      );
    } finally {
      setDeletingTestId(null);
    }
  };

  /*
   * Loading state.
   */
  if (isLoading) {
    return (
      <main className="w-full">
        <div className="space-y-5">
          <div className="h-32 animate-pulse rounded-[24px] border border-slate-200 bg-white" />

          <div className="h-16 animate-pulse rounded-[20px] border border-slate-200 bg-white" />

          <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-white">
            <div className="space-y-4 p-6">
              {Array.from({ length: 5 }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="h-12 animate-pulse rounded-xl bg-slate-100"
                  />
                ),
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full space-y-5 pb-8">
      {/* =========================================
          PAGE HEADER
      ========================================= */}

      <section className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white px-5 py-5 shadow-[0_10px_40px_-24px_rgba(15,23,42,0.22)] sm:px-6 sm:py-6">
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[17px] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600">
              <FlaskConical
                className="h-5 w-5"
                strokeWidth={1.8}
              />
            </div>

            <div className="min-w-0">
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Diagnostic Center
              </p>

              <h1 className="text-xl font-bold tracking-[-0.025em] text-slate-950 sm:text-2xl">
                {t("manageTests")}
              </h1>

              <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                Add and manage your diagnostic
                center&apos;s test catalog and pricing.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            // 🟢 NEW: শুধু তখনই ডিসেবল হবে যদি অ্যাডমিন কোনো গ্লোবাল টেস্ট না বানিয়ে থাকে
            disabled={
              globalTests.length === 0
            }
            className="
              inline-flex
              h-10
              shrink-0
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-slate-950
              px-4
              text-xs
              font-bold
              text-white
              shadow-[0_8px_22px_-12px_rgba(15,23,42,0.7)]
              transition-all
              hover:-translate-y-px
              hover:bg-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:hover:translate-y-0
            "
          >
            <Plus
              className="h-4 w-4"
              strokeWidth={2}
            />

            <span>{t("addTest")}</span>
          </button>
        </div>
      </section>

      {/* =========================================
          TOOLBAR
      ========================================= */}

      <section className="rounded-[21px] border border-slate-200 bg-white p-3 shadow-[0_7px_30px_-20px_rgba(15,23,42,0.18)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold text-slate-900">
              Test Catalog
            </p>

            <p className="mt-0.5 text-[10px] text-slate-400">
              {centerTests.length}{" "}
              {centerTests.length === 1
                ? "test"
                : "tests"}{" "}
              configured
            </p>
          </div>

          <div className="relative w-full sm:w-[280px]">
            <Search
              className="
                pointer-events-none
                absolute
                left-3
                top-1/2
                h-4
                w-4
                -translate-y-1/2
                text-slate-400
              "
              strokeWidth={1.8}
            />

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value,
                )
              }
              placeholder="Search your tests..."
              className="
                h-10
                w-full
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                pl-10
                pr-3
                text-xs
                font-medium
                text-slate-900
                outline-none
                transition-all
                placeholder:text-slate-400
                hover:border-slate-300
                focus:border-blue-500
                focus:bg-white
                focus:ring-4
                focus:ring-blue-500/10
              "
            />
          </div>
        </div>
      </section>

      {/* =========================================
          TEST LIST
      ========================================= */}

      <section className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_10px_40px_-25px_rgba(15,23,42,0.2)]">
        {filteredCenterTests.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400">
              {searchTerm ? (
                <Search
                  className="h-6 w-6"
                  strokeWidth={1.7}
                />
              ) : (
                <FlaskConical
                  className="h-6 w-6"
                  strokeWidth={1.7}
                />
              )}
            </div>

            <h2 className="mt-4 text-sm font-bold text-slate-900">
              {searchTerm
                ? "No tests found"
                : "No tests added yet"}
            </h2>

            <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-500">
              {searchTerm
                ? "Try searching with a different test name."
                : "Add your first diagnostic test to start managing your center's catalog."}
            </p>

            {!searchTerm &&
              availableGlobalTests.length > 0 && (
                <button
                  type="button"
                  onClick={openAddModal}
                  className="
                    mt-5
                    inline-flex
                    h-9
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-600
                    px-4
                    text-xs
                    font-bold
                    text-white
                    shadow-[0_8px_20px_-10px_rgba(37,99,235,0.7)]
                    transition
                    hover:bg-blue-700
                  "
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add First Test
                </button>
              )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[680px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Test Name
                    </th>

                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Price
                    </th>

                    <th className="px-6 py-3.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-3.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCenterTests.map(
                    (test) => {
                      const testName =
                        test.diagnosticTest
                          ?.name ||
                        "Unnamed test";

                      const price =
                        Number(test.price) || 0;

                      const isDeleting =
                        deletingTestId ===
                        test.id;

                      return (
                        <tr
                          key={test.id}
                          className="
                            group
                            transition-colors
                            hover:bg-slate-50/70
                          "
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                                <FlaskConical
                                  className="h-4 w-4"
                                  strokeWidth={1.8}
                                />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-xs font-bold text-slate-900">
                                  {testName}
                                </p>

                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  Diagnostic test
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="text-sm font-bold text-slate-900">
                              ₹{" "}
                              {price.toFixed(2)}
                            </span>
                          </td>

                          <td className="px-6 py-4">
                            {test.isAvailable ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">
                                <Check className="h-3 w-3" />
                                Available
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100 bg-rose-50 px-2.5 py-1 text-[10px] font-bold text-rose-700">
                                <X className="h-3 w-3" />
                                Unavailable
                              </span>
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    test,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                aria-label={`Edit ${testName}`}
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-transparent
                                  text-slate-400
                                  transition
                                  hover:border-blue-100
                                  hover:bg-blue-50
                                  hover:text-blue-600
                                  disabled:opacity-40
                                "
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(
                                    test.id,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                aria-label={`Remove ${testName}`}
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-lg
                                  border
                                  border-transparent
                                  text-slate-400
                                  transition
                                  hover:border-rose-100
                                  hover:bg-rose-50
                                  hover:text-rose-600
                                  disabled:opacity-40
                                "
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filteredCenterTests.map(
                (test) => {
                  const testName =
                    test.diagnosticTest
                      ?.name ||
                    "Unnamed test";

                  const price =
                    Number(test.price) || 0;

                  const isDeleting =
                    deletingTestId === test.id;

                  return (
                    <div
                      key={test.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-100 bg-blue-50 text-blue-600">
                            <FlaskConical className="h-4 w-4" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-slate-900">
                              {testName}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              Diagnostic test
                            </p>
                          </div>
                        </div>

                        {test.isAvailable ? (
                          <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                            Available
                          </span>
                        ) : (
                          <span className="shrink-0 rounded-full bg-rose-50 px-2 py-1 text-[9px] font-bold text-rose-700">
                            Unavailable
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <span className="text-sm font-bold text-slate-900">
                          ₹ {price.toFixed(2)}
                        </span>

                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                test,
                              )
                            }
                            disabled={isDeleting}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-50
                              text-slate-500
                              transition
                              hover:bg-blue-50
                              hover:text-blue-600
                            "
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                test.id,
                              )
                            }
                            disabled={isDeleting}
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-lg
                              bg-slate-50
                              text-slate-500
                              transition
                              hover:bg-rose-50
                              hover:text-rose-600
                            "
                          >
                            {isDeleting ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </>
        )}

        {isFetchingCenter && !isLoading && (
          <div className="flex items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/60 py-2.5 text-[10px] font-medium text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin" />
            Refreshing tests...
          </div>
        )}
      </section>

      {/* =========================================
          ADD / EDIT MODAL
      ========================================= */}

      {isModalOpen && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-slate-950/50
            p-4
            backdrop-blur-sm
          "
          role="dialog"
          aria-modal="true"
          aria-labelledby="test-modal-title"
        >
          <div className="relative w-full max-w-[440px] overflow-hidden rounded-[25px] border border-slate-200 bg-white shadow-[0_30px_80px_-25px_rgba(15,23,42,0.35)]">
            <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 px-6 pb-5 pt-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-100 bg-blue-50 text-blue-600">
                  {editingTest ? (
                    <Edit2 className="h-5 w-5" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <h2
                    id="test-modal-title"
                    className="text-base font-bold text-slate-950"
                  >
                    {editingTest
                      ? "Update Test"
                      : "Add New Test"}
                  </h2>

                  <p className="mt-1 text-[10px] text-slate-400">
                    {editingTest
                      ? "Update test pricing and availability."
                      : "Add a diagnostic test to your center."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={isSaving}
                aria-label="Close dialog"
                className="
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-xl
                  text-slate-400
                  transition
                  hover:bg-slate-100
                  hover:text-slate-700
                  disabled:opacity-40
                "
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4 px-6 pb-6"
            >
              {/* Test Selection */}
              {!editingTest ? (
                <div>
                  <label
                    htmlFor="testId"
                    className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Select Test
                  </label>

                  <select
                    id="testId"
                    {...register("testId", {
                      required:
                        "Please select a test",
                    })}
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-3
                      text-xs
                      font-medium
                      text-slate-900
                      outline-none
                      transition
                      hover:border-slate-300
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                  >
                    <option value="">
                      -- Choose a global test --
                    </option>

                    {availableGlobalTests.map(
                      (test: DiagnosticTest) => (
                        <option
                          key={test.id}
                          value={test.id}
                        >
                          {test.name}
                        </option>
                      ),
                    )}
                  </select>

                  {errors.testId && (
                    <p className="mt-1.5 text-[10px] font-medium text-rose-600">
                      {errors.testId.message}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="editing-test-name"
                    className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600"
                  >
                    Test Name
                  </label>

                  <input
                    id="editing-test-name"
                    type="text"
                    value={
                      editingTest
                        .diagnosticTest
                        ?.name ?? ""
                    }
                    disabled
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-slate-50
                      px-3
                      text-xs
                      font-semibold
                      text-slate-500
                      outline-none
                    "
                  />
                </div>
              )}

              {/* Price */}
              <div>
                <label
                  htmlFor="test-price"
                  className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-600"
                >
                  {t("testPrice")} (₹)
                </label>

                <input
                  id="test-price"
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="e.g. 500"
                  className={`
                    h-11
                    w-full
                    rounded-xl
                    border
                    bg-white
                    px-3
                    text-xs
                    font-medium
                    text-slate-900
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:ring-4
                    ${
                      errors.price
                        ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500/10"
                        : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-blue-500/10"
                    }
                  `}
                  {...register("price", {
                    required:
                      "Price is required",
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message:
                        "Price cannot be negative",
                    },
                  })}
                />

                {errors.price && (
                  <p className="mt-1.5 text-[10px] font-medium text-rose-600">
                    {errors.price.message}
                  </p>
                )}
              </div>

              {/* Availability */}
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 transition hover:border-slate-300 hover:bg-slate-50">
                <input
                  id="isAvailable"
                  type="checkbox"
                  {...register(
                    "isAvailable",
                  )}
                  className="
                    h-4
                    w-4
                    rounded
                    border-slate-300
                    text-blue-600
                    accent-blue-600
                    focus:ring-blue-500
                  "
                />

                <span>
                  <span className="block text-xs font-bold text-slate-800">
                    Currently Available
                  </span>

                  <span className="mt-0.5 block text-[10px] text-slate-400">
                    Show this test as available
                    at your diagnostic center.
                  </span>
                </span>
              </label>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSaving}
                  className="
                    h-10
                    rounded-xl
                    border
                    border-slate-200
                    bg-white
                    px-4
                    text-xs
                    font-bold
                    text-slate-600
                    transition
                    hover:border-slate-300
                    hover:bg-slate-50
                    hover:text-slate-900
                    disabled:opacity-40
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="
                    inline-flex
                    h-10
                    min-w-[110px]
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-slate-950
                    px-4
                    text-xs
                    font-bold
                    text-white
                    shadow-[0_8px_20px_-10px_rgba(15,23,42,0.7)]
                    transition
                    hover:bg-slate-800
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      {editingTest ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}

                      {editingTest
                        ? "Update Test"
                        : "Add Test"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}