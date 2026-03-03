export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  level: string; // "6ème", "3ème", etc.
  school: string;
  parentId: string;
  subjects: Array<{
    name: string;
    teacherId: string;
    teacherName: string;
    progress: number;
  }>;
}
