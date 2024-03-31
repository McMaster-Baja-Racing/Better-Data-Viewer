// Replaces the view at the given index with the new view
export const replaceViewAtIndex = (viewInformation, index, newView) => {
  return viewInformation.map((view, i) => {
    if (i === index) {
      return newView;
    }
    return view;
  });
};

// Adds a new view at the given index shifting all other views to the right and then trimming the last view
export const insertViewAtIndex = (viewInformation, index, newView) => {
  const tempViewInformation = viewInformation.slice(0, index).concat(newView).concat(viewInformation.slice(index, viewInformation.length - 1));
  return tempViewInformation.slice(0, viewInformation.length);
};
