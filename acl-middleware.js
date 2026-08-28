'use strict';

/*
========================================================
CLASS 8 - ACL MIDDLEWARE
========================================================

ACL = Access Control List

The job of this middleware is NOT to authenticate
the user.

That was Class 7's job.

The bearer middleware answers:

    "Is this a valid authenticated user?"

This middleware answers:

    "Does this authenticated user have the capability
     required by this route?"

--------------------------------------------------------

Example:

    app.get(
      '/secret',
      bearerAuth,
      acl('read'),
      (req, res) => {
        ...
      }
    );

The request must pass BOTH checks:

    bearerAuth
        ↓
    "Are you authenticated?"

        ↓

    acl('read')
        ↓
    "Can you READ?"

        ↓

    route
========================================================
*/


// ======================================================
// ACL MIDDLEWARE FACTORY
// ======================================================

/*
--------------------------------------------------------
This function accepts the capability we want to check.

For example:

    acl('read')

or:

    acl('delete')

But this function does NOT immediately receive
the normal Express middleware arguments:

    req
    res
    next

Instead, it returns another function.

That returned function IS the actual Express middleware.

--------------------------------------------------------

This is called CURRYING.

Think of it like:

    acl('read')
         ↓
    creates middleware
         ↓
    middleware(req, res, next)

The word "read" remains available to the returned
function through closure.
--------------------------------------------------------
*/

module.exports = (capability) => {

  /*
  ------------------------------------------------------
  This is the ACTUAL middleware that Express will run.
  ------------------------------------------------------
  */

  return (req, res, next) => {

    /*
    ----------------------------------------------------
    At this point bearerAuth should already have run.

    Therefore we expect:

        req.user

    to exist.

    And our JWT should have placed:

        req.user.capabilities

    into that object.
    ----------------------------------------------------
    */

    if (!req.user) {

      const error = new Error(
        'User authentication required.'
      );

      error.status = 401;

      return next(error);

    }


    /*
    ----------------------------------------------------
    Check whether the user has the capability required
    by this route.

    Example:

        capability = 'read'

    and:

        req.user.capabilities = ['read', 'create']

    Then:

        includes('read')

    returns true.
    ----------------------------------------------------
    */

    if (
      req.user.capabilities &&
      req.user.capabilities.includes(capability)
    ) {

      /*
      --------------------------------------------------
      The user has permission.

      Move to the next middleware/route.
      --------------------------------------------------
      */

      return next();

    }


    /*
    ----------------------------------------------------
    The user is authenticated BUT does not have
    permission.

    This is different from authentication failure.

    401:
        "I don't know who you are."

    403:
        "I know who you are, but you're not allowed
         to do this."
    ----------------------------------------------------
    */

    const error = new Error(
      `You do not have the '${capability}' capability.`
    );

    error.status = 403;

    return next(error);

  };

};