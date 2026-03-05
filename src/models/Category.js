// Category.js
// Parse Model for the Category class
// Each category groups tourist spots by type (e.g. Nature, Museum)
import Parse from "parse";

// CREATE - adds a new category to the database
export const createCategory = (name, spots) => {
  const Category = Parse.Object.extend("Category");
  const category = new Category();
  category.set("name", name);
  // spots is an array of pointers to TouristSpot objects
  // using Array because each category has fewer than 10 spots (Rule of 10)
  category.set("spots", spots);
  return category.save().then((result) => {
    return result;
  });
};

// READ - get all categories from the database
export const getAllCategories = () => {
  const Category = Parse.Object.extend("Category");
  const query = new Parse.Query(Category);
  return query.find().then((results) => {
    return results;
  });
};

// READ - get a single category by id
export const getCategoryById = (id) => {
  const Category = Parse.Object.extend("Category");
  const query = new Parse.Query(Category);
  return query.get(id).then((result) => {
    return result;
  });
};

// DELETE - remove a category by id
export const deleteCategory = (id) => {
  const Category = Parse.Object.extend("Category");
  const query = new Parse.Query(Category);
  return query.get(id).then((category) => {
    return category.destroy();
  });
};