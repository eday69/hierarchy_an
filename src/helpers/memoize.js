const memoize = (fn) => {
  let cache = {};
  return (...args) => {
    let n = args[0];  // just taking one argument here
    if (n.id in cache) {
      return cache[n.id];
    }
    else {
      let result = fn(n);
      cache[n.id] = result;
      return result;
    }
  }
}

const descendants = (node) => {
  if (typeof node._children === 'undefined') { return 0 }
  let count = node._children.length;

  node._children.forEach((child) => count = count + descendants(child))

  return count;
}

// managementCost
// managementCostRatio
// totalCost


const calcICCost = (node) => {
  let ic_cost = 0

  if (typeof node._children === 'undefined') {
    return node.data['Salary']
  }
  node._children.forEach((child) => ic_cost = ic_cost + calcICCost(child))

  return ic_cost;
}

const managementCost = (node) => {
  let management_cost = 0

  if (typeof node._children === 'undefined') {
    return 0
  }
  node._children.forEach((child) => management_cost = management_cost + node.data['Salary'] + managementCost(child))

  return management_cost;
}

const totalCost = (node) => {
  let total = node.data['Salary']
  if (typeof node._children === 'undefined') { return node.data['Salary'] }

  node._children.forEach((child) => total = total + totalCost(child))

  return total
}

export const memoizedCalc = memoize(descendants)
export const memoizedICCost = memoize(calcICCost)
export const memoizedManagementCost = memoize(managementCost)
export const memoizedTotalCost = memoize(totalCost)
