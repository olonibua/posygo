import { describe, expect, it } from "vitest";

import { kindFrom, parseContacts } from "./outreach-import";

describe("outreach import", () => {
  it("reads rows pasted from the partner leads spreadsheet", () => {
    const text = [
      "Country\tCity\tBusiness\tType\tWebsite\tEmail\tPhone\tWhy they fit\tSource\tStatus",
      "Canada\tBrampton, ON\tSmart Save Courier\tCourier with storage\thttps://www.smartsavecourier.com/\tsmartsavecourier@live.com\t(647) 534-4630\tAlready stores goods.\thttps://www.smartsavecourier.com/\tNot contacted",
      "Germany\tBerlin\tPrepPro Berlin\tPrep centre\thttps://www.prepproberlin.eu/\t\t\tPrep and storage.\thttps://example.test/\tNot contacted",
    ].join("\n");
    const { contacts, problems } = parseContacts(text);
    expect(problems).toEqual([]);
    expect(contacts).toEqual([
      expect.objectContaining({ business: "Smart Save Courier", country: "Canada", city: "Brampton, ON", kind: "COURIER", email: "smartsavecourier@live.com", notes: "Already stores goods." }),
      expect.objectContaining({ business: "PrepPro Berlin", kind: "PREP_CENTRE", website: "https://www.prepproberlin.eu/" }),
    ]);
    expect(contacts[1]).not.toHaveProperty("email");
  });

  it("reads quoted CSV and reports rows it can't use", () => {
    const { contacts, problems } = parseContacts('business,country,city,email\n"Lagos Link, Ltd",Canada,"Toronto, ON",desk@lagoslink.test\n,Canada,,');
    expect(contacts).toEqual([expect.objectContaining({ business: "Lagos Link, Ltd", city: "Toronto, ON", kind: "OTHER" })]);
    expect(problems).toEqual(["Row 3 is missing a business or country, so it was left out."]);
  });

  it("finds the header row below a title, and keeps both note columns", () => {
    const text = ["Posygo partner leads", "Edit Status as you go.", "", "Country\tBusiness\tWhy they fit\tNotes", "Canada\tBeta Prep\tStores seller stock.\tCalled once.", "", "Germany\tASAP Prep\t\t"].join("\n");
    const { contacts, problems } = parseContacts(text);
    expect(problems).toEqual([]);
    expect(contacts.map((contact) => [contact.business, contact.notes])).toEqual([
      ["Beta Prep", "Stores seller stock. Called once."],
      ["ASAP Prep", undefined],
    ]);
  });

  it("asks for a header with business and country", () => {
    expect(parseContacts("name,email\nA,a@b.test").problems).toEqual(["Include the header row with at least a Business and a Country column."]);
  });

  it("works out the type from everyday words", () => {
    expect(kindFrom("Nigeria cargo agent")).toBe("CARGO_AGENT");
    expect(kindFrom("Africa freight agent")).toBe("CARGO_AGENT");
    expect(kindFrom("Prep centre / 3PL")).toBe("PREP_CENTRE");
    expect(kindFrom("—")).toBe("OTHER");
  });
});
