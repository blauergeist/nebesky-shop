const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    // when deleting, I don't send anything back to the client, so no need to store the awaited result in a const
    const document = await Model.findByIdAndDelete(req.params.id);

    if (!document) {
      return next(new AppError('No document found with the provided ID', 404));
    }

    // 204 status code for "No Content"
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!document) {
      return next(new AppError('No document found with the provided ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const document = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: document,
      },
    });
  });

// popOptions stands for populate options
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) {
      // In case of need for additional field selecting choices, paths can be separated and forwarded as an array
      if (Array.isArray(popOptions)) {
        for (const option of popOptions) {
          query = query.populate(option);
        }
      } else if (popOptions.includes('.')) {
        // checks for nested population
        const options = popOptions.split('.');
        query = query.populate({
          path: options[0],
          populate: { path: options[1] },
        });
      } else {
        query = query.populate(popOptions);
      }
    }
    const document = await query;

    if (!document) {
      return next(new AppError('No document found with the provided ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: { document },
    });
  });

// exports.getAll = (Model) =>
//   catchAsync(async (req, res, next) => {
//     // To allow for nested GET reviews on tour
//     let filter = {};
//     if (req.params.tourId) filter = { tour: req.params.tourId };

//     // Execute query
//     const features = new APIFeatures(Model.find(filter), req.query)
//       .filter()
//       .sort()
//       .limitFields()
//       .paginate();

//     const document = await features.query;
//     //  For DB performance details add .explain() to the end of query:
//     //  const document = await features.query.explain();

//     res.status(200).json({
//       status: 'success',
//       results: document.length,
//       data: {
//         document,
//       },
//     });
//   });

exports.getAll = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    // To allow for nested GET reviews on tour
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    // Execute query
    let query = Model.find(filter);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }

    const features = new APIFeatures(query, req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const document = await features.query;

    res.status(200).json({
      status: 'success',
      results: document.length,
      data: {
        document,
      },
    });
  });
