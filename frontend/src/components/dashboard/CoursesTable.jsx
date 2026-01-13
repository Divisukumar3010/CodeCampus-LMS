import { useState, useMemo } from 'react';
import { FiBook } from 'react-icons/fi';

const CoursesTable = ({
    title,
    courses = [],
    enableSearch = true,
    enableTrainerFilter = true
}) => {
    const [search, setSearch] = useState('');
    const [selectedTrainer, setSelectedTrainer] = useState('all');

    // 🔹 Unique trainers
    const trainers = useMemo(() => {
        const map = new Map();
        courses.forEach(course => {
            if (course.trainer?._id) {
                map.set(course.trainer._id, course.trainer.name);
            }
        });
        return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
    }, [courses]);

    // 🔹 Combined filtering
    const filteredCourses = useMemo(() => {
        const q = search.toLowerCase();

        return courses.filter(course => {
            const matchesSearch =
                course.title?.toLowerCase().includes(q) ||
                course.trainer?.name?.toLowerCase().includes(q);

            const matchesTrainer =
                selectedTrainer === 'all' ||
                course.trainer?._id === selectedTrainer;

            return matchesSearch && matchesTrainer;
        });
    }, [courses, search, selectedTrainer]);

    return (
        <div>
            {/* Header + Filters */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900">{title}</h3>

                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {/* Search */}
                    {enableSearch && (
                        <input
                            type="text"
                            placeholder="Search by course or trainer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none w-full sm:w-64"
                        />
                    )}

                    {/* Trainer Filter */}
                    {enableTrainerFilter && trainers.length > 0 && (
                        <select
                            value={selectedTrainer}
                            onChange={(e) => setSelectedTrainer(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none w-full sm:w-56"
                        >
                            <option value="all">All Trainers</option>
                            {trainers.map(trainer => (
                                <option key={trainer.id} value={trainer.id}>
                                    {trainer.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
            </div>

            {/* Empty */}
            {!filteredCourses.length ? (
                <div className="text-center py-12">
                    <FiBook className="text-5xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg">No courses found</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Course
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Enrollments
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Revenue
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Rating
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-200">
                            {filteredCourses.map(course => (
                                <tr key={course._id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {course.title}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {course.trainer?.name || 'Unknown'}
                                        </p>
                                    </td>
                                    <td className="px-6 py-4">
                                        {course.enrollmentCount || 0}
                                    </td>
                                    <td className="px-6 py-4 text-green-600 font-semibold">
                                        ₹{(course.revenue || 0).toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-semibold">
                                            {(course.averageRating || 0).toFixed(1)}
                                        </span>
                                        <span className="text-yellow-500 ml-1">★</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CoursesTable;
